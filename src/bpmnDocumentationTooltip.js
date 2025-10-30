(function () {
  console.log('starting overlay with documentation about bpmn...');
  // --- Documentação resumida para cada tipo de elemento BPMN ---
  const BPMN_DOCS = {
    serviceTask: "Service Task:\nExecuta uma lógica automática implementada em código/serviço externo (Java, delegate, REST etc). Não requer interação humana.",
    scriptTask: "Script Task:\nExecuta um script embutido no processo. Útil para automações simples sem dependência externa.",
    userTask: "User Task:\nTarefa manual atribuída a um usuário ou grupo. Necessita interação humana.",
    manualTask: "Manual Task:\nAtividade fora do sistema, não automatizada nem rastreada pelo engine.",
    receiveTask: "Receive Task:\nAguarda explicitamente uma mensagem externa para prosseguir.",
    businessRuleTask: "Business Rule Task:\nExecuta regras de negócio (DMN, decisão automatizada, decision table).",
    sendTask: "Send Task:\nEnvia uma mensagem para outro processo/sistema.",
    callActivity: "Call Activity:\nChama outro processo ou subprocesso de forma reutilizável.",
    subProcess: "SubProcesso:\nAgrupa atividades. Pode ser embutido ou disparado por evento.",
    eventSubProcess: "Event SubProcess:\nSubprocesso disparado por um evento (timer, message, signal etc).",
    startEvent: "Start Event:\nIndica o início do processo. Pode ser disparado por eventos diversos.",
    endEvent: "End Event:\nIndica o fim do processo ou de um caminho do fluxo.",
    intermediateCatchEvent: "Intermediate Catch Event:\nAguarda um evento intermediário acontecer (timer, message, signal, etc).",
    intermediateThrowEvent: "Intermediate Throw Event:\nDispara um evento intermediário (mensagem, sinal, erro, etc).",
    boundaryEvent: "Boundary Event:\nEvento ligado à borda de uma atividade, geralmente para exceções (timeout, erro, signal/message).",
    exclusiveGateway: "Gateway Exclusivo (XOR):\nDesvia o fluxo para apenas UM caminho, conforme condição.",
    parallelGateway: "Gateway Paralelo (AND):\nDivide ou sincroniza múltiplos caminhos para execução paralela.",
    inclusiveGateway: "Gateway Inclusivo (OR):\nPode seguir um ou mais caminhos a depender das condições.",
    eventBasedGateway: "Gateway Baseado em Evento:\nDesvia o fluxo conforme qual evento acontecer primeiro.",
    complexGateway: "Complex Gateway:\nPermite condições e comportamentos de controle de fluxo avançados/complexos.",
    sequenceFlow: "Sequence Flow:\nConecta e ordena elementos. Pode conter condições.",
    timerEvent: "Timer Event:\nDispara com base em tempo, datas ou ciclos.",
    messageEvent: "Message Event:\nRecebe (Catch) ou envia (Throw) uma mensagem para outro processo/sistema.",
    signalEvent: "Signal Event:\nDispara (Throw) ou aguarda (Catch) sinais amplamente visíveis no engine.",
    errorEvent: "Error Event:\nIndica ou trata ocorrência de erro no fluxo.",
    escalationEvent: "Escalation Event:\nPermite tratar situações de exceção sem interromper totalmente o fluxo.",
    compensationEvent: "Compensation Event:\nDefine ações de compensação (desfazer/ajustar).",
    multiInstance: "Multi-Instance (Loop):\nExecuta o elemento múltiplas vezes, em sequência ou paralelo, para cada item de uma lista.",
    conditionalEvent: "Conditional Event:\nDispara ou aguarda condição booleana definida em expressão.",
    terminateEvent: "Terminate End Event:\nFinaliza todo o processo/instância imediatamente.",
    // Outras tasks para Camunda/BPMN
    task: "Task:\nAtividade genérica (não especificada, raramente usada em BPMN real).",
    // Outras ampliações podem ser feitas aqui...
  };

  const BASE_API = location.pathname.split('/app/')[0];

  // --- Utilitário: copiar delegate expression "limpo"
  function copyToClipboardDelegate(text) {
    let final = text;
    const match = text.match(/^\$\{(.+)\}$/);
    if (match) final = match[1];
    navigator.clipboard.writeText(final).catch(() => {
      const textarea = document.createElement("textarea");
      textarea.value = final;
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand('copy');
      document.body.removeChild(textarea);
    });
  }

  // --- Utilitário: mensagem flutuante
  function showFloatingMsg(msg) {
    let el = document.createElement('div');
    el.textContent = msg;
    Object.assign(el.style, {
      position: 'fixed', top: '20px', left: '50%', transform: 'translateX(-50%)',
      background: '#222', color: '#fff', padding: '8px 24px', borderRadius: '6px',
      fontSize: '16px', zIndex: 9999, boxShadow: '0 2px 8px #0008', opacity: 0.96
    });
    document.body.appendChild(el);
    setTimeout(() => { el.remove(); }, 1800);
  }

  // --- Tooltip customizado (div flutuante, seleção/cópia, design moderno)
  let tooltipDiv;
  function showTooltip(msg, evt) {
    hideTooltip();
    tooltipDiv = document.createElement('div');
    tooltipDiv.innerHTML = msg.replace(/\n/g, '<br>');
    Object.assign(tooltipDiv.style, {
      position: 'fixed', left: '0px', top: '0px', zIndex: 99999,
      background: 'rgba(30,34,48,0.98)', color: '#F8F8F2', border: '1px solid #555',
      borderRadius: '8px', padding: '13px 20px', fontFamily: 'monospace,monospace',
      fontSize: '14px', boxShadow: '0 6px 32px #000c, 0 1px 4px #0004',
      pointerEvents: 'none', maxWidth: '540px', whiteSpace: 'pre-wrap',
      wordBreak: 'break-word', userSelect: 'text', transition: 'opacity 0.10s', opacity: 0.98
    });
    positionTooltip(evt);
    setTimeout(() => {
      document.body.appendChild(tooltipDiv);
      window.addEventListener('scroll', hideTooltip, { once: true });
    });
  }
  function hideTooltip() {
    if (tooltipDiv && tooltipDiv.parentNode) tooltipDiv.parentNode.removeChild(tooltipDiv);
    tooltipDiv = null;
  }
  function positionTooltip(evt) {
    if (!tooltipDiv || !evt) return;
    let { clientX: x, clientY: y } = evt;
    let pad = 14;
    setTimeout(() => {
      let rect = tooltipDiv.getBoundingClientRect();
      let nx = Math.min(x + pad, window.innerWidth - rect.width - 5);
      let ny = Math.min(y + pad, window.innerHeight - rect.height - 5);
      tooltipDiv.style.left = nx + 'px';
      tooltipDiv.style.top = ny + 'px';
    });
  }

  // --- Glow highlight ao passar mouse
  function addGlow(svgElem) {
    if (!svgElem) return;
    svgElem._oldFilter = svgElem.style.filter;
    svgElem.style.filter = 'drop-shadow(0 0 7px #00e6ffb0)';
  }
  function removeGlow(svgElem) {
    if (!svgElem) return;
    svgElem.style.filter = svgElem._oldFilter || '';
    delete svgElem._oldFilter;
  }

  // Remove tooltips/eventos antigos e limpa SVG
  function clearOldAnnotations() {
    document.querySelectorAll('[data-element-id]').forEach(el => {
      el.style.filter = '';
      el.style.cursor = '';
      delete el._hasDblClickListener;
      delete el._hasMiddleClickListener;
      delete el._hasSubProcessListener;
      el._hasTooltipListeners = false;
      const title = el.querySelector('title');
      if (title) title.textContent = "";
    });
    hideTooltip();
  }

  // --- Estado de cache/referência
  let lastContext = null, lastProcessDefinitionId = null, lastBpmnXml = null, lastCallActivityDefIds = null, lastHasRendered = false, lastProcessInstanceId = null;

  function getHashInfo() {
    const hash = location.hash.replace(/\?.*$/, '');
    let processDefinitionId = null, processInstanceId = null, context = null;
    let match = hash.match(/process-definition\/([^\/?#]+)/);
    if (match) { processDefinitionId = match[1]; context = 'definition'; }
    else {
      match = hash.match(/process-instance\/([^\/?#]+)/);
      if (match) { processInstanceId = match[1]; context = 'instance'; }
    }
    return { processDefinitionId, processInstanceId, context };
  }

  function updateCallActivityListenersOnly(context, processInstanceId, callActivityDefIds) {
    document.querySelectorAll('[data-element-id]').forEach(el => {
      const title = el.querySelector('title');
      if (!title) return;
      // Call Activities
      if (/\[CallActivity\]/.test(title.textContent)) {
        delete el._hasMiddleClickListener;
        el.style.cursor = "";
        const info = /Chama: (.*)/.exec(title.textContent);
        const calledElement = info && info[1] ? info[1].split('\n')[0] : null;
        if (!calledElement) return;
        if (!el._hasMiddleClickListener) {
          el._hasMiddleClickListener = true;
          el.style.cursor = "pointer";
          el.addEventListener('mousedown', function handler(ev) {
            if (ev.button !== 1 || !calledElement) return;
            ev.preventDefault();
            const API_BASE_CUSTOM = BASE_API + '/api/cockpit/plugin/base/default';
            if (context === 'instance') {
              if (!processInstanceId) { showFloatingMsg('Sem processInstanceId na URL!'); return; }
              fetch(`${API_BASE_CUSTOM}/process-instance/${processInstanceId}/called-process-instances`, {
                method: 'POST',
                headers: { 'accept': 'application/json, text/plain, */*', 'content-type': 'application/json;charset=UTF-8' },
                credentials: 'include',
                body: JSON.stringify({ "activityInstanceIdIn": [] })
              })
                .then(r => r.json())
                .then(list => {
                  if (!list || !list.length) { showFloatingMsg('Nenhuma instância chamada encontrada!'); return; }
                  let found = list.find(i => i.callActivityId === calledElement);
                  if (!found) found = list[0];
                  if (found && found.id) {
                    const basePath = location.pathname.split('/app/')[0];
                    window.open(`${basePath}/app/cockpit/default/#/process-instance/${found.id}`, '_blank');
                  } else { showFloatingMsg('Instância chamada não encontrada!'); }
                })
                .catch(() => showFloatingMsg('Erro ao buscar instância chamada!'));
            } else {
              const calledDefId = callActivityDefIds && callActivityDefIds[calledElement];
              const basePath = location.pathname.split('/app/')[0];
              if (!calledDefId) { showFloatingMsg('Processo não encontrado pelo key!'); return; }
              window.open(`${basePath}/app/cockpit/default/#/process-definition/${calledDefId}`, '_blank');
            }
          });
        }
      }
      // SubProcess embutido/event subprocess
      if (/\[SubProcess\]/.test(title.textContent)) {
        delete el._hasSubProcessListener;
        el.style.cursor = "";
        if (!el._hasSubProcessListener) {
          el._hasSubProcessListener = true;
          el.style.cursor = "pointer";
          el.addEventListener('mousedown', function handler(ev) {
            if (ev.button === 1) {
              ev.preventDefault();
              if (processInstanceId) {
                const basePath = location.pathname.split('/app/')[0];
                window.open(`${basePath}/app/cockpit/default/#/process-instance/${processInstanceId}`, '_blank');
              } else {
                showFloatingMsg("Instância não detectada na URL. Abra o diagrama por uma instância de processo!");
              }
            }
          });
        }
      }
    });
  }

  // --- Função principal de renderização BPMN
  function initBpmnAnnotations(forceFullRedraw) {
    const { processDefinitionId, processInstanceId, context } = getHashInfo();
    if (lastHasRendered && lastProcessDefinitionId === processDefinitionId && lastContext !== context) {
      updateCallActivityListenersOnly(context, processInstanceId, lastCallActivityDefIds);
      lastContext = context;
      lastProcessInstanceId = processInstanceId;
      return;
    }
    if (lastHasRendered && lastProcessDefinitionId === processDefinitionId && lastContext === context && lastProcessInstanceId === processInstanceId) return;
    if (!processDefinitionId && !processInstanceId) return;
    clearOldAnnotations();
    const API_BASE_CUSTOM = BASE_API + '/api/cockpit/plugin/base/default';
    const apiBase = BASE_API + '/api/engine/engine/default';

    function fetchAndAnnotate(defId, apiBase, processInstanceId = null, context) {
      fetch(`${apiBase}/process-definition/${defId}/xml`)
        .then(r => r.json())
        .then(data => {
          lastBpmnXml = data.bpmn20Xml;
          parseAndAnnotateBpmn(data.bpmn20Xml, apiBase, processInstanceId, context);
        })
        .catch(e => alert('Erro ao buscar BPMN XML: ' + e));
    }

    function parseAndAnnotateBpmn(bpmnXml, apiBase, processInstanceId, context) {
      // ---- Função principal de anotação (tooltip customizado) ----
      function annotateDiagram(bpmnElementId, infoText, options = {}) {
        const svgElem = document.querySelector(`[data-element-id="${bpmnElementId}"]`);
        if (!svgElem) return;
        // Tooltip customizado (mouseenter/move/leave)
        if (!svgElem._hasTooltipListeners) {
          svgElem.addEventListener('mouseenter', function (evt) { addGlow(svgElem); showTooltip(infoText, evt); });
          svgElem.addEventListener('mousemove', function (evt) { positionTooltip(evt); });
          svgElem.addEventListener('mouseleave', function () { removeGlow(svgElem); hideTooltip(); });
          svgElem._hasTooltipListeners = true;
        }
        // Delegate/class copy no dblclick
        if (options.copyValue && !svgElem._hasDblClickListener) {
          svgElem._hasDblClickListener = true;
          svgElem.style.cursor = "copy";
          svgElem.addEventListener('dblclick', function (ev) {
            ev.stopPropagation();
            copyToClipboardDelegate(options.copyValue);
            showFloatingMsg(`${options.copyLabel || "Copiado"}: ${options.copyValue}`);
          });
        }
        // Middle click navegação CallActivity
        if (options.calledElement && options.apiBase && options.context && !svgElem._hasMiddleClickListener) {
          svgElem._hasMiddleClickListener = true;
          svgElem.style.cursor = "pointer";
          svgElem.addEventListener('mousedown', function (ev) {
            if (ev.button !== 1 || !options.calledElement) return;
            ev.preventDefault();
            if (options.context === 'instance') {
              if (!options.processInstanceId) { showFloatingMsg('Sem processInstanceId na URL!'); return; }
              fetch(`${API_BASE_CUSTOM}/process-instance/${options.processInstanceId}/called-process-instances`, {
                method: 'POST',
                headers: { 'accept': 'application/json, text/plain, */*', 'content-type': 'application/json;charset=UTF-8' },
                credentials: 'include',
                body: JSON.stringify({ "activityInstanceIdIn": [] })
              })
                .then(r => r.json())
                .then(list => {
                  if (!list || !list.length) { showFloatingMsg('Nenhuma instância chamada encontrada!'); return; }
                  let found = list.find(i => i.callActivityId === options.calledElement);
                  if (!found) found = list[0];
                  if (found && found.id) {
                    const basePath = location.pathname.split('/app/')[0];
                    window.open(`${basePath}/app/cockpit/default/#/process-instance/${found.id}`, '_blank');
                  } else { showFloatingMsg('Instância chamada não encontrada!'); }
                })
                .catch(() => showFloatingMsg('Erro ao buscar instância chamada!'));
            } else {
              const calledDefId = lastCallActivityDefIds && lastCallActivityDefIds[options.calledElement];
              const basePath = location.pathname.split('/app/')[0];
              if (!calledDefId) { showFloatingMsg('Processo não encontrado pelo key!'); return; }
              window.open(`${basePath}/app/cockpit/default/#/process-definition/${calledDefId}`, '_blank');
            }
          });
        }
        // Middle click navegação SubProcess
        if (options.isSubProcess && !svgElem._hasSubProcessListener) {
          svgElem._hasSubProcessListener = true;
          svgElem.style.cursor = "pointer";
          svgElem.addEventListener('mousedown', function (ev) {
            if (ev.button === 1) {
              ev.preventDefault();
              if (options.processInstanceId) {
                const basePath = location.pathname.split('/app/')[0];
                window.open(`${basePath}/app/cockpit/default/#/process-instance/${options.processInstanceId}`, '_blank');
              } else {
                showFloatingMsg("Instância não detectada na URL. Abra o diagrama por uma instância de processo!");
              }
            }
          });
        }
      }

      const parser = new DOMParser();
      const xmlDoc = parser.parseFromString(bpmnXml, "text/xml");
      // Call Activities para mapeamento
      const callActivities = Array.from(xmlDoc.getElementsByTagNameNS('*', 'callActivity'));
      const callActivityDefIds = {};
      const callActivityPromises = callActivities.map(ca => {
        const calledElement = ca.getAttribute('calledElement') || '';
        if (!calledElement) return Promise.resolve();
        return fetch(`${apiBase}/process-definition?key=${encodeURIComponent(calledElement)}&latestVersion=true`)
          .then(r => r.json())
          .then(list => {
            if (list && list.length) {
              list.sort((a, b) => b.version - a.version);
              callActivityDefIds[calledElement] = list[0].id;
            }
          })
          .catch(() => { });
      });

      Promise.all(callActivityPromises).then(() => {
        lastCallActivityDefIds = callActivityDefIds;

        // ---- Tasks detalhadas: ServiceTask, ScriptTask, etc ----
        [
          'serviceTask', 'scriptTask', 'businessRuleTask', 'sendTask', 'manualTask', 'userTask', 'receiveTask', 'task'
        ].forEach(tag => {
          Array.from(xmlDoc.getElementsByTagNameNS('*', tag)).forEach(task => {
            const id = task.getAttribute('id');
            const name = task.getAttribute('name') || '';
            let doc = BPMN_DOCS[tag] || BPMN_DOCS.task;
            let info = `${doc}\n[${tag.charAt(0).toUpperCase() + tag.slice(1)}]\nName: ${name}\nID: ${id}`;
            let copyValue = null, copyLabel = null;

            // Implementação (delegate, class, expression)
            if (tag === 'serviceTask') {
              let implType = '', implValue = '';
              if (task.hasAttribute('camunda:delegateExpression') || task.hasAttribute('delegateExpression')) {
                implType = 'Delegate expression';
                implValue = task.getAttribute('camunda:delegateExpression') || task.getAttribute('delegateExpression');
                copyValue = implValue;
                copyLabel = "Delegate copiado";
              } else if (task.hasAttribute('camunda:class') || task.hasAttribute('class')) {
                implType = 'Java Class';
                implValue = task.getAttribute('camunda:class') || task.getAttribute('class');
                copyValue = implValue;
                copyLabel = "Classe copiada";
              } else if (task.hasAttribute('camunda:expression') || task.hasAttribute('expression')) {
                implType = 'Expression';
                implValue = task.getAttribute('camunda:expression') || task.getAttribute('expression');
                copyValue = implValue;
                copyLabel = "Expressão copiada";
              }
              if (implType) info += `\nImplementation: ${implType}\n${implType}: ${implValue}`;
            }

            // ScriptTask
            if (tag === 'scriptTask') {
              let scriptFormat = task.getAttribute('scriptFormat') || task.getAttribute('camunda:scriptFormat') || '';
              const scriptTag = task.getElementsByTagNameNS('*', 'script')[0];
              let scriptContent = scriptTag && scriptTag.textContent ? scriptTag.textContent.trim() : '';
              if (scriptFormat) info += `\nScript Format: ${scriptFormat}`;
              if (scriptContent) info += `\nScript: ${scriptContent}`;
            }

            if (tag === 'receiveTask') {
              let messageRef = task.getAttribute('messageRef');
              if (!messageRef) {
                const msgEl = task.getElementsByTagNameNS('*', 'messageEventDefinition')[0];
                if (msgEl) messageRef = msgEl.getAttribute('messageRef');
              }
              let msgName = '';
              if (messageRef) {
                const msgNode = xmlDoc.querySelector(`message[id="${messageRef}"]`);
                if (msgNode) msgName = msgNode.getAttribute('name') || '';
              }
              // let info = `[ReceiveTask]${name ? ' ' + name : ''}`;
              if (messageRef) info += `\nmessageRef: ${messageRef}`;
              if (msgName) info += `\nMensagem: ${msgName}`;
            }

            // Async/Exclusive
            const asyncBefore = (task.getAttribute('camunda:asyncBefore') === 'true' || task.getAttribute('asyncBefore') === 'true');
            const asyncAfter = (task.getAttribute('camunda:asyncAfter') === 'true' || task.getAttribute('asyncAfter') === 'true');
            const exclusive = (task.getAttribute('camunda:exclusive') !== 'false' && task.getAttribute('exclusive') !== 'false');
            info += `\nAsync Before: ${asyncBefore ? '✔' : '✘'} | Async After: ${asyncAfter ? '✔' : '✘'} | Exclusive: ${exclusive ? '✔' : '✘'}`;

            // inputOutput
            let inputs = [], outputs = [];
            const io = task.getElementsByTagNameNS('*', 'inputOutput')[0];
            if (io) {
              Array.from(io.getElementsByTagNameNS('*', 'inputParameter')).forEach(inp => {
                const n = inp.getAttribute('name');
                let v = inp.textContent ? inp.textContent.trim() : '';
                if (!v && inp.firstElementChild) v = inp.firstElementChild.textContent.trim();
                inputs.push(`${n}: ${v}`);
              });
              Array.from(io.getElementsByTagNameNS('*', 'outputParameter')).forEach(outp => {
                const n = outp.getAttribute('name');
                let v = outp.textContent ? outp.textContent.trim() : '';
                if (!v && outp.firstElementChild) v = outp.firstElementChild.textContent.trim();
                outputs.push(`${n}: ${v}`);
              });
            }
            if (inputs.length) info += `\nInputs:\n ${inputs.join('\n ')}`;
            if (outputs.length) info += `\nOutputs:\n ${outputs.join('\n ')}`;

            // executionListener
            let listeners = [];
            Array.from(task.getElementsByTagNameNS('*', 'executionListener')).forEach(listener => {
              const event = listener.getAttribute('event');
              const type = listener.hasAttribute('class') ? 'class'
                : listener.hasAttribute('delegateExpression') ? 'delegateExpression'
                  : listener.hasAttribute('expression') ? 'expression' : '';
              const val = listener.getAttribute(type) || '';
              listeners.push(`${event}: ${type}=${val}`);
            });
            if (listeners.length) info += `\nExecution listeners:\n ${listeners.join('\n ')}`;

            // extensionProperties
            let extProps = [];
            Array.from(task.getElementsByTagNameNS('*', 'properties')).forEach(propsNode => {
              Array.from(propsNode.getElementsByTagNameNS('*', 'property')).forEach(prop => {
                const n = prop.getAttribute('name');
                const v = prop.getAttribute('value');
                extProps.push(`${n}: ${v}`);
              });
            });
            if (extProps.length) info += `\nExtension properties:\n ${extProps.join('\n ')}`;

            // field injection
            let fields = [];
            Array.from(task.getElementsByTagNameNS('*', 'field')).forEach(field => {
              const n = field.getAttribute('name');
              let v = field.getAttribute('stringValue') || '';
              if (!v) {
                const strTag = field.getElementsByTagNameNS('*', 'string')[0];
                if (strTag && strTag.textContent) v = strTag.textContent.trim();
              }
              fields.push(`${n}: ${v}`);
            });
            if (fields.length) info += `\nField injections:\n ${fields.join('\n ')}`;

            // Multi-instance
            const mi = task.getElementsByTagNameNS('*', 'multiInstanceLoopCharacteristics')[0];
            if (mi) {
              let isSequential = mi.getAttribute('isSequential') === 'true';
              let loopCardinality = mi.getElementsByTagNameNS('*', 'loopCardinality')[0];
              let collection = mi.getAttribute('camunda:collection') || mi.getAttribute('collection');
              let miInfo = `Multi-Instance: ${isSequential ? "Sequential" : "Parallel"}`;
              if (loopCardinality && loopCardinality.textContent) miInfo += `\nCardinality: ${loopCardinality.textContent}`;
              if (collection) miInfo += `\nCollection: ${collection}`;
              info += `\n${BPMN_DOCS.multiInstance}\n${miInfo}`;
            }

            annotateDiagram(id, info, { copyValue, copyLabel });
          });
        });

        // Subprocessos Embutidos/Event SubProcess
        Array.from(xmlDoc.getElementsByTagNameNS('*', 'subProcess')).forEach(sp => {
          const id = sp.getAttribute('id');
          const name = sp.getAttribute('name') || '';
          const triggeredByEvent = sp.getAttribute('triggeredByEvent') === 'true';
          let doc = triggeredByEvent ? (BPMN_DOCS.eventSubProcess || BPMN_DOCS.subProcess) : BPMN_DOCS.subProcess;
          let info = `${doc}\n[SubProcess] ${name}\nID: ${id}\n${triggeredByEvent ? "Event SubProcess" : "Embedded SubProcess"}`;
          const mi = sp.getElementsByTagNameNS('*', 'multiInstanceLoopCharacteristics')[0];
          if (mi) {
            let isSequential = mi.getAttribute('isSequential') === 'true';
            let loopCardinality = mi.getElementsByTagNameNS('*', 'loopCardinality')[0];
            let collection = mi.getAttribute('camunda:collection') || mi.getAttribute('collection');
            let miInfo = `Multi-Instance: ${isSequential ? "Sequential" : "Parallel"}`;
            if (loopCardinality && loopCardinality.textContent) miInfo += `\nCardinality: ${loopCardinality.textContent}`;
            if (collection) miInfo += `\nCollection: ${collection}`;
            info += `\n${BPMN_DOCS.multiInstance}\n${miInfo}`;
          }
          annotateDiagram(id, info, { isSubProcess: true, processInstanceId });
        });

        // CallActivity
        callActivities.forEach(ca => {
          const id = ca.getAttribute('id');
          const name = ca.getAttribute('name') || '';
          const calledElement = ca.getAttribute('calledElement') || '';
          let doc = BPMN_DOCS.callActivity;
          let info = `${doc}\n[CallActivity] ${name}\nID: ${id}\nChama: ${calledElement}`;
          const mi = ca.getElementsByTagNameNS('*', 'multiInstanceLoopCharacteristics')[0];
          if (mi) {
            let isSequential = mi.getAttribute('isSequential') === 'true';
            let loopCardinality = mi.getElementsByTagNameNS('*', 'loopCardinality')[0];
            let collection = mi.getAttribute('camunda:collection') || mi.getAttribute('collection');
            let miInfo = `Multi-Instance: ${isSequential ? "Sequential" : "Parallel"}`;
            if (loopCardinality && loopCardinality.textContent) miInfo += `\nCardinality: ${loopCardinality.textContent}`;
            if (collection) miInfo += `\nCollection: ${collection}`;
            info += `\n${BPMN_DOCS.multiInstance}\n${miInfo}`;
          }
          annotateDiagram(id, info, { calledElement, apiBase, context, processInstanceId });
        });

        // Gateways
        [
          ['exclusiveGateway', 'exclusiveGateway'], ['parallelGateway', 'parallelGateway'],
          ['inclusiveGateway', 'inclusiveGateway'], ['eventBasedGateway', 'eventBasedGateway'],
          ['complexGateway', 'complexGateway']
        ].forEach(([tag, docKey]) => {
          Array.from(xmlDoc.getElementsByTagNameNS('*', tag)).forEach(gw => {
            const id = gw.getAttribute('id');
            const name = gw.getAttribute('name') || '';
            let doc = BPMN_DOCS[docKey];
            let info = `${doc}\n[${tag}]\n${name ? 'Name: ' + name + '\n' : ''}ID: ${id}`;
            annotateDiagram(id, info);
          });
        });

        // Sequence Flow (condições)
        Array.from(xmlDoc.getElementsByTagNameNS('*', 'sequenceFlow')).forEach(flow => {
          const id = flow.getAttribute('id');
          const condExpr = Array.from(flow.getElementsByTagNameNS('*', 'conditionExpression'))[0];
          let doc = BPMN_DOCS.sequenceFlow;
          if (condExpr) {
            const condition = condExpr.textContent.trim();
            annotateDiagram(id, `${doc}\n[Condition]\n${condition}`);
          } else {
            annotateDiagram(id, `${doc}`);
          }
        });

        // Event types (Timer, Message, Signal, etc)
        const eventTypes = [
          ['startEvent', 'startEvent', null, 'StartEvent'],
          ['endEvent', 'endEvent', null, 'EndEvent'],
          ['intermediateCatchEvent', 'intermediateCatchEvent', null, 'IntermediateCatchEvent'],
          ['intermediateThrowEvent', 'intermediateThrowEvent', null, 'IntermediateThrowEvent'],
          ['boundaryEvent', 'boundaryEvent', null, 'BoundaryEvent'],
        ];
        eventTypes.forEach(([tag, docKey, defTag, label]) => {
          Array.from(xmlDoc.getElementsByTagNameNS('*', tag)).forEach(ev => {
            const id = ev.getAttribute('id');
            const name = ev.getAttribute('name') || '';
            let foundType = null, doc = BPMN_DOCS[docKey];
            // Event Definitions: Timer, Message, Signal, Error, Escalation, Compensation, Conditional, Terminate
            const evDefs = [
              ['timerEventDefinition', BPMN_DOCS.timerEvent],
              ['messageEventDefinition', BPMN_DOCS.messageEvent],
              ['signalEventDefinition', BPMN_DOCS.signalEvent],
              ['errorEventDefinition', BPMN_DOCS.errorEvent],
              ['escalationEventDefinition', BPMN_DOCS.escalationEvent],
              ['compensateEventDefinition', BPMN_DOCS.compensationEvent],
              ['conditionalEventDefinition', BPMN_DOCS.conditionalEvent],
              ['terminateEventDefinition', BPMN_DOCS.terminateEvent]
            ];
            let extra = "";
            evDefs.forEach(([def, docStr]) => {
              const defEl = ev.getElementsByTagNameNS('*', def)[0];
              if (defEl) {
                foundType = def;
                doc = docStr;
                if (def === 'timerEventDefinition') {
                  ['timeDuration', 'timeCycle', 'timeDate'].forEach(type => {
                    const t = defEl.getElementsByTagNameNS('*', type)[0];
                    if (t && t.textContent) { extra += `${type}: ${t.textContent.trim()}\n`; }
                  });
                }
                if (def === 'messageEventDefinition') {
                  let msgRef = defEl.getAttribute('messageRef');
                  let msgName = '';
                  if (msgRef) {
                    const msgNode = xmlDoc.querySelector(`message[id="${msgRef}"]`);
                    if (msgNode) msgName = msgNode.getAttribute('name') || '';
                  }
                  if (msgRef) extra += `messageRef: ${msgRef}\n`;
                  if (msgName) extra += `Mensagem: ${msgName}\n`;
                }
                if (def === 'signalEventDefinition') {
                  let sigRef = defEl.getAttribute('signalRef');
                  let sigName = '';
                  if (sigRef) {
                    const sigNode = xmlDoc.querySelector(`signal[id="${sigRef}"]`);
                    if (sigNode) sigName = sigNode.getAttribute('name') || '';
                  }
                  if (sigRef) extra += `signalRef: ${sigRef}\n`;
                  if (sigName) extra += `Signal: ${sigName}\n`;
                }
                if (def === 'errorEventDefinition') {
                  let errRef = defEl.getAttribute('errorRef');
                  let errName = '';
                  if (errRef) {
                    const errNode = xmlDoc.querySelector(`error[id="${errRef}"]`);
                    if (errNode) errName = errNode.getAttribute('name') || '';
                  }
                  if (errRef) extra += `errorRef: ${errRef}\n`;
                  if (errName) extra += `Error: ${errName}\n`;
                }
              }
            });
            let info = `${doc}\n[${label}]${name ? ' ' + name : ''}\nID: ${id}`;
            if (extra) info += `\n${extra.trim()}`;
            annotateDiagram(id, info);
          });
        });

        console.log('Anotações adicionadas!\nPasse o mouse sobre tasks/eventos para ver tooltips (com documentação e todos os atributos!).\nDuplo clique em ServiceTask copia delegate/class limpa.\nBotão do meio em CallActivity abre definição ou instância chamada, conforme contexto.');
        lastHasRendered = true;
        lastContext = context;
        lastProcessDefinitionId = processDefinitionId;
        lastProcessInstanceId = processInstanceId;
      });
    }

    if (context === 'instance') {
      fetch(`${apiBase}/process-instance/${processInstanceId}`)
        .then(r => r.json()).then(data => {
          if (data.definitionId) {
            if (lastProcessDefinitionId !== data.definitionId || forceFullRedraw) {
              fetchAndAnnotate(data.definitionId, apiBase, processInstanceId, context);
            } else {
              updateCallActivityListenersOnly(context, processInstanceId, lastCallActivityDefIds);
              lastContext = context;
              lastProcessInstanceId = processInstanceId;
            }
          } else {
            alert('Não foi possível obter o processDefinitionId!');
          }
        }).catch(e => alert('Erro ao buscar processDefinitionId: ' + e));
    } else {
      if (lastProcessDefinitionId !== processDefinitionId || forceFullRedraw) {
        fetchAndAnnotate(processDefinitionId, apiBase, null, context);
      } else {
        updateCallActivityListenersOnly(context, null, lastCallActivityDefIds);
        lastContext = context;
        lastProcessInstanceId = null;
      }
    }
  }

  // EXECUÇÃO: só iniciar após sumir o loading!
  function startWhenDiagramIsReady() {
    const loadingSelectors = ['div.placeholder-container', 'div.app-splash'];
    const diagramSelectors = ['g.layer-base'];

    function isLoadingPresent() {
      return loadingSelectors.some(selector => document.querySelector(selector));
    }

    function isDiagramPresent() {
      return diagramSelectors.some(selector => document.querySelector(selector));
    }

    if (!isLoadingPresent() && isDiagramPresent()) {
      runScriptLogic();
      return;
    }

    const observer = new MutationObserver(() => {
      if (!isLoadingPresent() && isDiagramPresent()) {
        observer.disconnect();
        runScriptLogic();
      }
    });

    observer.observe(document.body, { childList: true, subtree: true });
  }

  function runScriptLogic() {
    console.log('Running script logic...');
    initBpmnAnnotations(true);
    window.addEventListener('hashchange', function () {
      setTimeout(() => { initBpmnAnnotations(false); }, 100);
    });
  }
  startWhenDiagramIsReady();
})();

