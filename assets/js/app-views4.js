/* SAFE-PARKS CISO Portal — management console.
   Local-first management layer: audit trail, tasks, decisions, risk acceptance,
   KPI/budget actuals, document metadata, snapshots and data health. */
(function () {
  "use strict";
  var SP = window.SP;
  SP.views = SP.views || {};

  function H() { return SP.h; }
  function tx(en, tr) { return H().state.lang === "en" ? en : tr; }
  function esc(v) { return H().esc(v); }
  function opt(values, current, labels) {
    return values.map(function (v) {
      var label = labels && labels[v] ? labels[v] : v;
      return '<option value="' + esc(v) + '"' + (v === current ? " selected" : "") + ">" + esc(label) + "</option>";
    }).join("");
  }
  function riskById(id) {
    return (SP.risks || []).filter(function (r) { return r.id === id; })[0] || null;
  }
  function taskStatus(t) {
    return { open: tx("Open", "Açık"), "in-progress": tx("In progress", "Devam ediyor"), blocked: tx("Blocked", "Bloke"), done: tx("Done", "Tamam") }[t] || t;
  }
  function decisionStatus(t) {
    return { pending: tx("Pending", "Bekliyor"), approved: tx("Approved", "Onaylandı"), rejected: tx("Rejected", "Reddedildi") }[t] || t;
  }
  function toast(message) { H().toast(message); }
  function saveAndRender() {
    var h = H();
    h.save();
    h.render();
  }
  function audit(action, detail) {
    var h = H();
    h.audit(action, detail);
  }

  SP.views.management = {
    render: function () {
      var h = H(), st = h.state, data = st.data, M = SP.manage;
      var auth = window.SP_AUTH || {};
      M.ensure(data);
      var health = M.health(data, null, (SP.decisions || []).map(function (d) { return d.id; }));
      var tasks = health.tasks;
      var out = h.head(
        tx("MANAGEMENT", "YÖNETİM"),
        tx("Management console", "Yönetim konsolu"),
        tx("One place for changes, approvals, evidence, backups and the audit trail. This is a local-first console; server-side multi-user access still needs a backend.",
          "Değişiklikler, onaylar, kanıtlar, yedekler ve denetim izi tek yerde. Bu yerel öncelikli bir konsoldur; sunucu tarafı çok kullanıcılı erişim için hâlâ backend gerekir.")
      );

      out += '<div class="grid g4" style="margin-bottom:14px">' +
        h.kpi(tx("Open tasks", "Açık görev"), String(tasks.open + tasks.inProgress + tasks.blocked), tx("Overdue: ", "Gecikmiş: ") + tasks.overdue, false) +
        h.kpi(tx("Pending decisions", "Bekleyen karar"), String(health.pendingDecisions), tx("Decision register", "Karar kaydı"), true) +
        h.kpi(tx("Risk acceptances", "Risk kabulü"), String(health.riskAcceptances), tx("Expired: ", "Süresi geçmiş: ") + health.expiredAcceptances, false) +
        h.kpi(tx("Audit entries", "Denetim kaydı"), String(health.auditEntries), tx("Snapshots: ", "Yedek: ") + health.snapshots, false) +
        "</div>";

      out += '<div class="grid g2" style="margin-bottom:14px">';
      out += h.card(h.cardHead(tx("Session and data", "Oturum ve veri"), tx("Who is editing and where the state lives", "Kim düzenliyor ve veri nerede")) +
        '<div class="split-list">' +
        '<div><div class="k">' + esc(tx("User", "Kullanıcı")) + '</div><div class="v">' + esc(auth.label || tx("Local user", "Yerel kullanıcı")) + '</div></div>' +
        '<div><div class="k">' + esc(tx("Role", "Rol")) + '</div><div class="v">' + esc(auth.role || "editor") + '</div></div>' +
        '<div><div class="k">' + esc(tx("Storage", "Depolama")) + '</div><div class="v mono tiny">localStorage · safeparks-ciso-v1</div></div>' +
        '<div><div class="k">' + esc(tx("Last save", "Son kayıt")) + '</div><div class="v mono tiny">' + esc(st.updatedAt || "—") + '</div></div>' +
        "</div>" +
        '<div class="row" style="gap:8px;flex-wrap:wrap;margin-top:10px">' +
        '<button class="btn btn-sm" data-mgmt-logout>' + esc(tx("Sign out", "Çıkış yap")) + "</button>" +
        '<button class="btn btn-sm" data-act="export-json">' + esc(tx("Download full state", "Tam durumu indir")) + "</button>" +
        '<button class="btn btn-sm" data-act="export-brief">' + esc(tx("Download brief state", "Brief durumunu indir")) + "</button>" +
        "</div>" +
        h.callout(esc(tx("The password gate is client-side. Use a server-side access proxy for real confidentiality.",
          "Şifre kapısı istemci tarafındadır. Gerçek gizlilik için sunucu tarafı erişim proxy'si kullanın.")), "warn", "!"));
      out += h.card(h.cardHead(tx("Data health", "Veri sağlığı"), tx("Schema, backup and open work", "Şema, yedek ve açık işler")) +
        '<div class="split-list">' +
        '<div><div class="k">' + esc(tx("Schema", "Şema")) + '</div><div class="v mono">v' + esc(st.schemaVersion || M.SCHEMA_VERSION) + "</div></div>" +
        '<div><div class="k">' + esc(tx("Tasks", "Görevler")) + '</div><div class="v">' + tasks.total + " " + esc(tx("total", "toplam")) + " · " + tasks.done + " " + esc(tx("done", "tamam")) + " · " + tasks.overdue + " " + esc(tx("overdue", "gecikmiş")) + "</div></div>" +
        '<div><div class="k">' + esc(tx("Decisions", "Kararlar")) + '</div><div class="v">' + health.pendingDecisions + " " + esc(tx("pending", "bekliyor")) + "</div></div>" +
        '<div><div class="k">' + esc(tx("KPI actuals", "KPI gerçekleşen")) + '</div><div class="v">' + health.kpiActuals + " / " + (SP.kpis || []).length + "</div></div>" +
        '<div><div class="k">' + esc(tx("Budget actuals", "Bütçe gerçekleşen")) + '</div><div class="v">' + health.budgetActuals + " / " + (SP.wp3Budget || []).length + "</div></div>" +
        "</div>" +
        h.callout(esc(tx("Create a snapshot before imports, resets or a major status change. Snapshots stay in this browser until exported.",
          "İçe aktarma, sıfırlama veya büyük bir durum değişikliğinden önce yedek oluşturun. Yedekler dışa aktarılana kadar bu tarayıcıda kalır.")), "", "i"));
      out += "</div>";

      /* ---------------- tasks ---------------- */
      var taskRows = data.tasks.slice().sort(function (a, b) {
        if (!a.due) return 1;
        if (!b.due) return -1;
        return String(a.due).localeCompare(String(b.due));
      }).map(function (t) {
        return "<td><strong>" + esc(t.title) + "</strong>" + (t.note ? '<div class="tiny t-muted">' + esc(t.note) + "</div>" : "") + "</td>" +
          "<td>" + esc(t.owner || "—") + "</td>" +
          '<td class="nowrap mono tiny">' + esc(t.due || "—") + "</td>" +
          '<td><select class="status-select" data-task-status="' + esc(t.id) + '">' + opt(M.STATUS.tasks, t.status || "open", {
            open: taskStatus("open"), "in-progress": taskStatus("in-progress"), blocked: taskStatus("blocked"), done: taskStatus("done")
          }) + "</select></td>" +
          '<td class="nowrap"><button class="btn btn-sm" data-task-del="' + esc(t.id) + '">' + esc(tx("Delete", "Sil")) + "</button></td>";
      });
      out += '<div style="margin-bottom:14px">' + h.card(h.cardHead(tx("Tasks and actions", "Görevler ve aksiyonlar"), tx("Owner, due date and status", "Sorumlu, son tarih ve durum")) +
        '<div class="mgmt-form">' +
        '<input class="mgmt-input" data-task-title placeholder="' + esc(tx("Task title", "Görev başlığı")) + '">' +
        '<input class="mgmt-input" data-task-owner placeholder="' + esc(tx("Owner", "Sorumlu")) + '">' +
        '<input class="mgmt-input" type="date" data-task-due aria-label="' + esc(tx("Due date", "Son tarih")) + '">' +
        '<input class="mgmt-input" data-task-note placeholder="' + esc(tx("Note", "Not")) + '">' +
        '<button class="btn btn-primary" data-task-add>' + esc(tx("Add task", "Görev ekle")) + "</button>" +
        "</div>" +
        h.table([
          { label: tx("Task", "Görev") }, { label: tx("Owner", "Sorumlu") }, { label: tx("Due", "Son tarih") },
          { label: tx("Status", "Durum") }, { label: "" }
        ], taskRows, { foot: esc(tx("Tasks are stored in this browser. Export the full state to back them up or move them.",
          "Görevler bu tarayıcıda saklanır. Yedeklemek veya taşımak için tam durumu dışa aktarın.")) })) + "</div>";

      /* ---------------- decisions ---------------- */
      var decRows = (SP.decisions || []).map(function (d) {
        var meta = data.decisionMeta[d.id] || {};
        var cur = data.decisions[d.id] || "pending";
        return '<td class="col-id">' + esc(d.id) + "</td>" +
          "<td><strong>" + esc(h.L(d.t)) + "</strong><div class=\"tiny t-muted\">" + esc(h.L(d.detail)) + "</div></td>" +
          '<td><select class="status-select" data-decision-status="' + esc(d.id) + '">' + opt(["pending", "approved", "rejected"], cur, {
            pending: decisionStatus("pending"), approved: decisionStatus("approved"), rejected: decisionStatus("rejected")
          }) + "</select></td>" +
          '<td><input class="mgmt-input" data-decision="' + esc(d.id) + '|approver" value="' + esc(meta.approver || "") + '" placeholder="' + esc(tx("Approver", "Onaylayan")) + '"></td>' +
          '<td><input class="mgmt-input" type="date" data-decision="' + esc(d.id) + '|date" value="' + esc(meta.date || "") + '"></td>' +
          '<td><input class="mgmt-input" data-decision="' + esc(d.id) + '|rationale" value="' + esc(meta.rationale || "") + '" placeholder="' + esc(tx("Rationale", "Gerekçe")) + '"></td>';
      });
      out += '<div style="margin-bottom:14px">' + h.card(h.cardHead(tx("Decision register", "Karar kaydı"), tx("Status, approver, date and rationale", "Durum, onaylayan, tarih ve gerekçe")) +
        h.table([
          { label: "ID" }, { label: tx("Decision", "Karar") }, { label: tx("Status", "Durum") },
          { label: tx("Approver", "Onaylayan") }, { label: tx("Date", "Tarih") }, { label: tx("Rationale", "Gerekçe") }
        ], decRows) +
        '<div class="row" style="margin-top:9px"><button class="btn btn-primary" data-decisions-save>' + esc(tx("Save decisions", "Kararları kaydet")) + "</button></div>") + "</div>";

      /* ---------------- risk acceptance ---------------- */
      var accRows = Object.keys(data.riskAcceptance || {}).map(function (rid) {
        var acc = data.riskAcceptance[rid] || {};
        var risk = riskById(rid) || {};
        return '<td class="col-id">' + esc(rid) + "</td><td><strong>" + esc(risk.t ? h.L(risk.t) : rid) + "</strong></td>" +
          "<td>" + esc(acc.acceptedBy || "—") + "</td><td class=\"nowrap mono tiny\">" + esc(acc.date || "—") + "</td>" +
          "<td class=\"nowrap mono tiny\">" + esc(acc.expires || "—") + "</td><td>" + esc(acc.residual || "—") + "</td>" +
          '<td><button class="btn btn-sm" data-risk-accept-del="' + esc(rid) + '">' + esc(tx("Remove", "Kaldır")) + "</button></td>";
      });
      var riskOptions = (SP.risks || []).map(function (r) {
        return '<option value="' + esc(r.id) + '">' + esc(r.id + " · " + h.L(r.t)) + "</option>";
      }).join("");
      out += '<div style="margin-bottom:14px">' + h.card(h.cardHead(tx("Risk acceptance", "Risk kabulü"), tx("Record residual risk, owner and expiry", "Artık risk, sahip ve son kullanma tarihi")) +
        '<div class="mgmt-form">' +
        '<select class="mgmt-input" data-risk-accept-id>' + riskOptions + "</select>" +
        '<input class="mgmt-input" data-risk-accepted-by placeholder="' + esc(tx("Accepted by", "Kabul eden")) + '">' +
        '<input class="mgmt-input" type="date" data-risk-accept-date aria-label="' + esc(tx("Acceptance date", "Kabul tarihi")) + '">' +
        '<input class="mgmt-input" type="date" data-risk-accept-expires aria-label="' + esc(tx("Expiry", "Son kullanma")) + '">' +
        '<input class="mgmt-input" data-risk-residual placeholder="' + esc(tx("Residual score", "Artık skor")) + '">' +
        '<input class="mgmt-input" data-risk-rationale placeholder="' + esc(tx("Rationale", "Gerekçe")) + '">' +
        '<button class="btn btn-primary" data-risk-accept-save>' + esc(tx("Record acceptance", "Kabulü kaydet")) + "</button>" +
        "</div>" +
        (accRows.length ? h.table([
          { label: "Risk" }, { label: tx("Title", "Başlık") }, { label: tx("Accepted by", "Kabul eden") },
          { label: tx("Date", "Tarih") }, { label: tx("Expiry", "Son kullanma") }, { label: tx("Residual", "Artık") }, { label: "" }
        ], accRows) : '<div class="empty">' + esc(tx("No risk acceptance recorded.", "Kayıtlı risk kabulü yok.")) + "</div>")) + "</div>";

      /* ---------------- KPI actuals ---------------- */
      var kpiRows = (SP.kpis || []).map(function (k) {
        var val = data.kpi[k.id] === undefined ? "" : data.kpi[k.id];
        return '<td class="col-id">' + esc(k.id) + "</td><td><strong>" + esc(h.L(k.name)) + "</strong><div class=\"tiny t-muted\">" + esc(h.L(k.def)) + "</div></td>" +
          '<td><input class="mgmt-input" data-kpi="' + esc(k.id) + '" value="' + esc(val) + '" placeholder="' + esc(k.target) + '"></td>' +
          '<td class="nowrap tiny">' + esc(k.target) + "</td><td class=\"tiny\">" + esc(k.owner) + "</td>";
      });
      out += '<div style="margin-bottom:14px">' + h.card(h.cardHead(tx("KPI actuals", "KPI gerçekleşenleri"), tx("Enter the current value; reporting uses it when present", "Güncel değeri girin; raporlama varsa bunu kullanır")) +
        h.table([
          { label: "ID" }, { label: tx("KPI", "Gösterge") }, { label: tx("Current", "Mevcut") },
          { label: tx("Target", "Hedef") }, { label: tx("Owner", "Sahip") }
        ], kpiRows) +
        '<div class="row" style="margin-top:9px"><button class="btn btn-primary" data-kpi-save>' + esc(tx("Save KPI actuals", "KPI gerçekleşenlerini kaydet")) + "</button></div>") + "</div>";

      /* ---------------- budget actuals ---------------- */
      var budgetRows = (SP.wp3Budget || []).map(function (b, i) {
        var actual = data.budgetActual["b" + i];
        var actualNum = Number(actual || 0);
        var variance = actual === undefined || actual === "" ? "—" : h.money(actualNum - b.amount);
        return "<td>" + esc(h.L(b.cat)) + "</td><td class=\"num\">" + h.money(b.amount) + "</td>" +
          '<td><input class="mgmt-input" type="number" min="0" step="1000" data-budget="b' + i + '" value="' + esc(actual === undefined ? "" : actual) + '"></td>' +
          '<td class="num tiny">' + esc(variance) + "</td>";
      });
      out += '<div style="margin-bottom:14px">' + h.card(h.cardHead(tx("WP3 budget actuals", "WP3 bütçe gerçekleşenleri"), tx("Planned, actual and variance", "Planlanan, gerçekleşen ve sapma")) +
        h.table([
          { label: tx("Category", "Kategori") }, { label: tx("Planned", "Planlanan") },
          { label: tx("Actual", "Gerçekleşen") }, { label: tx("Variance", "Sapma") }
        ], budgetRows) +
        '<div class="row" style="margin-top:9px"><button class="btn btn-primary" data-budget-save>' + esc(tx("Save budget actuals", "Bütçe gerçekleşenlerini kaydet")) + "</button></div>") + "</div>";

      /* ---------------- document metadata ---------------- */
      var docRows = (SP.docs || []).map(function (d) {
        var meta = data.docMeta[d.id] || {};
        return '<td class="col-id">' + esc(d.code) + "</td><td><strong>" + esc(h.L(d.title)) + "</strong></td>" +
          '<td><input class="mgmt-input" data-docmeta="' + esc(d.id) + '|version" value="' + esc(meta.version || d.version) + '"></td>' +
          '<td><input class="mgmt-input" data-docmeta="' + esc(d.id) + '|approval" value="' + esc(meta.approval || d.approval) + '"></td>' +
          '<td><input class="mgmt-input" type="date" data-docmeta="' + esc(d.id) + '|review" value="' + esc(meta.review || "") + '"></td>';
      });
      out += '<div style="margin-bottom:14px">' + h.card(h.cardHead(tx("Document control", "Doküman kontrolü"), tx("Policy version, approval and review date", "Politika sürümü, onay ve gözden geçirme tarihi")) +
        h.table([
          { label: tx("Code", "Kod") }, { label: tx("Document", "Doküman") }, { label: tx("Version", "Sürüm") },
          { label: tx("Approval", "Onay") }, { label: tx("Review", "Gözden geçirme") }
        ], docRows) +
        '<div class="row" style="margin-top:9px"><button class="btn btn-primary" data-docmeta-save>' + esc(tx("Save document control", "Doküman kontrolünü kaydet")) + "</button></div>") + "</div>";

      /* ---------------- snapshots ---------------- */
      var snapRows = (data.snapshots || []).map(function (s) {
        return '<td class="nowrap mono tiny">' + esc(String(s.at || "").slice(0, 19).replace("T", " ")) + "</td>" +
          "<td>" + esc(s.label || "—") + "<div class=\"tiny t-muted\">" + esc(s.user || "") + "</div></td>" +
          '<td class="nowrap"><button class="btn btn-sm" data-snapshot-restore="' + esc(s.id) + '">' + esc(tx("Restore", "Geri yükle")) + "</button> " +
          '<button class="btn btn-sm" data-snapshot-delete="' + esc(s.id) + '">' + esc(tx("Delete", "Sil")) + "</button></td>";
      });
      out += '<div style="margin-bottom:14px">' + h.card(h.cardHead(tx("Backups and restore", "Yedekler ve geri yükleme"), tx("Local snapshots; export the full state for off-device backup", "Yerel yedekler; cihaz dışı yedek için tam durumu dışa aktarın")) +
        '<div class="mgmt-form"><input class="mgmt-input" data-snapshot-label placeholder="' + esc(tx("Snapshot label", "Yedek etiketi")) + '">' +
        '<button class="btn btn-primary" data-snapshot-create>' + esc(tx("Create snapshot", "Yedek oluştur")) + "</button></div>" +
        (snapRows.length ? h.table([
          { label: tx("Created", "Oluşturma") }, { label: tx("Label", "Etiket") }, { label: "" }
        ], snapRows) : '<div class="empty">' + esc(tx("No snapshots yet.", "Henüz yedek yok.")) + "</div>")) + "</div>";

      /* ---------------- audit ---------------- */
      var auditRows = (data.audit || []).slice(-40).reverse().map(function (a) {
        var detail = a.detail && typeof a.detail === "object" ? JSON.stringify(a.detail) : String(a.detail || "");
        return '<td class="nowrap mono tiny">' + esc(String(a.at || "").slice(0, 19).replace("T", " ")) + "</td>" +
          "<td>" + esc(a.user || "—") + '<div class="tiny t-muted">' + esc(a.role || "") + "</div></td>" +
          "<td><strong>" + esc(a.action || "") + '</strong><div class="tiny t-muted audit-detail">' + esc(detail) + "</div></td>";
      });
      out += '<div style="margin-bottom:14px">' + h.card(h.cardHead(tx("Audit trail", "Denetim izi"), tx("Newest first; export before sharing", "En yeni önce; paylaşmadan önce dışa aktarın"),
        '<div class="row" style="gap:8px"><button class="btn btn-sm" data-mgmt-export-audit>' + esc(tx("Audit CSV", "Denetim CSV")) + "</button>" +
        '<button class="btn btn-sm" data-mgmt-export-ics>' + esc(tx("Task calendar", "Görev takvimi")) + "</button></div>") +
        (auditRows.length ? h.table([
          { label: tx("When", "Zaman") }, { label: tx("Who", "Kim") }, { label: tx("Action", "İşlem") }
        ], auditRows) : '<div class="empty">' + esc(tx("No changes recorded yet.", "Henüz değişiklik kaydı yok.")) + "</div>")) + "</div>";

      return out;
    }
  };

  /* ---------------- management events ---------------- */
  document.addEventListener("click", function (e) {
    var h = H();
    if (!h || h.state.route.split("/")[0] !== "management") return;

    if (e.target.closest("[data-mgmt-logout]")) {
      if (window.SP_AUTH_SIGNOUT) window.SP_AUTH_SIGNOUT();
      return;
    }

    if (e.target.closest("[data-task-add]")) {
      var title = document.querySelector("[data-task-title]");
      var owner = document.querySelector("[data-task-owner]");
      var due = document.querySelector("[data-task-due]");
      var note = document.querySelector("[data-task-note]");
      var text = title ? String(title.value || "").trim() : "";
      if (!text) { toast(tx("Task title is required.", "Görev başlığı gerekli.")); if (title) title.focus(); return; }
      var task = {
        id: h.manage.uid("task"),
        title: text,
        owner: owner ? String(owner.value || "").trim() : "",
        due: due ? String(due.value || "").trim() : "",
        note: note ? String(note.value || "").trim() : "",
        status: "open",
        createdAt: new Date().toISOString(),
        createdBy: (window.SP_AUTH || {}).label || "Local user"
      };
      h.state.data.tasks.push(task);
      audit("task.create", { id: task.id, title: task.title, owner: task.owner, due: task.due });
      saveAndRender();
      toast(tx("Task added.", "Görev eklendi."));
      return;
    }

    var taskDelete = e.target.closest("[data-task-del]");
    if (taskDelete) {
      var taskId = taskDelete.getAttribute("data-task-del");
      var task = h.state.data.tasks.filter(function (t) { return t.id === taskId; })[0];
      if (!task || !window.confirm(tx("Delete this task?", "Bu görev silinsin mi?"))) return;
      h.state.data.tasks = h.state.data.tasks.filter(function (t) { return t.id !== taskId; });
      audit("task.delete", { id: taskId, title: task.title });
      saveAndRender();
      return;
    }

    if (e.target.closest("[data-decisions-save]")) {
      var changed = 0;
      document.querySelectorAll("[data-decision-status]").forEach(function (sel) {
        var id = sel.getAttribute("data-decision-status");
        var next = sel.value;
        var before = h.state.data.decisions[id] || "pending";
        if (before !== next) {
          h.state.data.decisions[id] = next;
          audit("decision.status", { id: id, before: before, after: next });
          changed++;
        }
      });
      document.querySelectorAll("[data-decision]").forEach(function (input) {
        var parts = String(input.getAttribute("data-decision")).split("|");
        var id = parts[0], field = parts[1];
        h.state.data.decisionMeta[id] = h.state.data.decisionMeta[id] || {};
        h.state.data.decisionMeta[id][field] = String(input.value || "").trim();
      });
      audit("decision.metadata", { decisions: (SP.decisions || []).length });
      saveAndRender();
      toast(tx("Decisions saved.", "Kararlar kaydedildi.") + (changed ? " " + changed + " " + tx("status changes", "durum değişikliği") : ""));
      return;
    }

    if (e.target.closest("[data-risk-accept-save]")) {
      var pick = document.querySelector("[data-risk-accept-id]");
      var rid = pick ? pick.value : "";
      if (!rid) return;
      var acceptedBy = document.querySelector("[data-risk-accepted-by]");
      var accDate = document.querySelector("[data-risk-accept-date]");
      var expires = document.querySelector("[data-risk-accept-expires]");
      var residual = document.querySelector("[data-risk-residual]");
      var rationale = document.querySelector("[data-risk-rationale]");
      h.state.data.riskAcceptance[rid] = {
        acceptedBy: acceptedBy ? String(acceptedBy.value || "").trim() : "",
        date: accDate ? String(accDate.value || "").trim() : "",
        expires: expires ? String(expires.value || "").trim() : "",
        residual: residual ? String(residual.value || "").trim() : "",
        rationale: rationale ? String(rationale.value || "").trim() : ""
      };
      h.state.data.risks[rid] = "accepted";
      audit("risk.accept", { id: rid, acceptance: h.state.data.riskAcceptance[rid] });
      saveAndRender();
      toast(tx("Risk acceptance recorded.", "Risk kabulü kaydedildi."));
      return;
    }

    var riskDel = e.target.closest("[data-risk-accept-del]");
    if (riskDel) {
      var riskId = riskDel.getAttribute("data-risk-accept-del");
      delete h.state.data.riskAcceptance[riskId];
      if (h.state.data.risks[riskId] === "accepted") h.state.data.risks[riskId] = "treating";
      audit("risk.accept.remove", { id: riskId });
      saveAndRender();
      return;
    }

    if (e.target.closest("[data-kpi-save]")) {
      var count = 0;
      document.querySelectorAll("[data-kpi]").forEach(function (input) {
        var id = input.getAttribute("data-kpi");
        var value = String(input.value || "").trim();
        if (value) { h.state.data.kpi[id] = value; count++; }
        else delete h.state.data.kpi[id];
      });
      audit("kpi.actuals", { count: count });
      saveAndRender();
      toast(tx("KPI actuals saved.", "KPI gerçekleşenleri kaydedildi."));
      return;
    }

    if (e.target.closest("[data-budget-save]")) {
      var bcount = 0;
      document.querySelectorAll("[data-budget]").forEach(function (input) {
        var id = input.getAttribute("data-budget");
        var value = String(input.value || "").trim();
        if (value) { h.state.data.budgetActual[id] = Number(value); bcount++; }
        else delete h.state.data.budgetActual[id];
      });
      audit("budget.actuals", { count: bcount });
      saveAndRender();
      toast(tx("Budget actuals saved.", "Bütçe gerçekleşenleri kaydedildi."));
      return;
    }

    if (e.target.closest("[data-docmeta-save]")) {
      document.querySelectorAll("[data-docmeta]").forEach(function (input) {
        var parts = String(input.getAttribute("data-docmeta")).split("|");
        var id = parts[0], field = parts[1];
        h.state.data.docMeta[id] = h.state.data.docMeta[id] || {};
        h.state.data.docMeta[id][field] = String(input.value || "").trim();
      });
      audit("document.control", { documents: (SP.docs || []).length });
      saveAndRender();
      toast(tx("Document control saved.", "Doküman kontrolü kaydedildi."));
      return;
    }

    if (e.target.closest("[data-snapshot-create]")) {
      var labelInput = document.querySelector("[data-snapshot-label]");
      var label = labelInput ? String(labelInput.value || "").trim() : "";
      var snap = h.manage.createSnapshot(h.state.data, label || tx("Manual snapshot", "Manuel yedek"), window.SP_AUTH || {});
      audit("snapshot.create", { id: snap.id, label: snap.label });
      h.save();
      h.render();
      toast(tx("Snapshot created.", "Yedek oluşturuldu."));
      return;
    }

    var restore = e.target.closest("[data-snapshot-restore]");
    if (restore) {
      var sid = restore.getAttribute("data-snapshot-restore");
      if (!window.confirm(tx("Restore this snapshot? Current changes will be replaced.", "Bu yedek geri yüklensin mi? Mevcut değişiklikler değişecek."))) return;
      if (h.manage.restoreSnapshot(h.state.data, sid)) {
        audit("snapshot.restore", { id: sid });
        h.save();
        h.render();
        toast(tx("Snapshot restored.", "Yedek geri yüklendi."));
      }
      return;
    }

    var snapDel = e.target.closest("[data-snapshot-delete]");
    if (snapDel) {
      var did = snapDel.getAttribute("data-snapshot-delete");
      if (!window.confirm(tx("Delete this snapshot?", "Bu yedek silinsin mi?"))) return;
      h.manage.removeSnapshot(h.state.data, did);
      audit("snapshot.delete", { id: did });
      h.save();
      h.render();
      return;
    }

    if (e.target.closest("[data-mgmt-export-audit]")) {
      h.download("safeparks-audit-log.csv", h.manage.auditCsv(h.state.data), "text/csv;charset=utf-8");
      toast(tx("Audit log downloaded.", "Denetim kaydı indirildi."));
      return;
    }

    if (e.target.closest("[data-mgmt-export-ics]")) {
      h.download("safeparks-tasks.ics", h.manage.tasksIcs(h.state.data), "text/calendar;charset=utf-8");
      toast(tx("Task calendar downloaded.", "Görev takvimi indirildi."));
      return;
    }
  });

  document.addEventListener("change", function (e) {
    var h = H();
    if (!h || h.state.route.split("/")[0] !== "management") return;
    var sel = e.target.closest("[data-task-status]");
    if (!sel) return;
    var id = sel.getAttribute("data-task-status");
    var task = h.state.data.tasks.filter(function (t) { return t.id === id; })[0];
    if (!task) return;
    var before = task.status || "open";
    task.status = sel.value;
    audit("task.status", { id: id, title: task.title, before: before, after: task.status });
    h.save();
    h.render();
  });
})();
