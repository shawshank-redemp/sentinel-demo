import { useEffect, useRef, useState } from 'react'

export type PipelinePhase = 'idle' | 'running' | 'gate' | 'approved' | 'denied' | 'done'

interface PipelineProps {
  phase: PipelinePhase
  onPhaseChange: (phase: PipelinePhase) => void
}

interface StageConfig {
  id: string
  icon: string
  name: string
  tag?: { label: string; cls: string }
  duration: number
  logs: Array<{ time: string; text: string; cls?: string }>
  isGate?: boolean
}

const STAGES: StageConfig[] = [
  {
    id: 's1',
    icon: '🔍',
    name: 'Pod failure detected',
    duration: 1400,
    logs: [
      { time: '09:14:22', text: 'DetectionModule: WATCH event received' },
      { time: '09:14:22', text: 'pod/api-gateway-7d4f9b  → CrashLoopBackOff', cls: 'em' },
      { time: '09:14:22', text: 'restart_count=4, severity=HIGH, transient_gate=passed' },
      { time: '09:14:22', text: '→ escalating to TrueForge agent', cls: 'ok' },
    ],
  },
  {
    id: 's2',
    icon: '🤖',
    name: 'TrueForge agent triggered',
    duration: 1200,
    logs: [
      { time: '09:14:23', text: 'TrueForgeAgentTrigger: opening session' },
      { time: '09:14:23', text: 'POST /api/v1/runs  →  run_id=r_7f3a91c', cls: 'em' },
      { time: '09:14:23', text: 'Claude loaded · MCP connectors: k8s-prod, k8s-sandbox' },
      { time: '09:14:23', text: '→ agent loop started', cls: 'ok' },
    ],
  },
  {
    id: 's3',
    icon: '🔌',
    name: 'K8s MCP tool called — logs fetched',
    tag: { label: 'real tool', cls: 'tag-real' },
    duration: 1800,
    logs: [
      { time: '09:14:24', text: 'Claude → call_tool(k8s-prod, kubectl_logs, pod=api-gateway-7d4f9b)' },
      { time: '09:14:24', text: 'ERROR: env var DB_HOST not set — connection refused', cls: 'err' },
      { time: '09:14:24', text: 'Claude → call_tool(k8s-prod, kubectl_events, pod=api-gateway-7d4f9b)' },
      { time: '09:14:25', text: '→ 47 log lines + 3 events retrieved via real K8s MCP', cls: 'ok' },
    ],
  },
  {
    id: 's4',
    icon: '🧠',
    name: 'Root cause diagnosed',
    duration: 1600,
    logs: [
      { time: '09:14:26', text: 'Claude reasoning over 47 log lines + 3 events…' },
      { time: '09:14:26', text: 'ROOT CAUSE: missing env var DB_HOST in Deployment spec', cls: 'em' },
      { time: '09:14:26', text: 'confidence=0.97 · container=api-gateway · exit_code=1' },
      { time: '09:14:26', text: '→ remediation plan generated', cls: 'ok' },
    ],
  },
  {
    id: 's5',
    icon: '🛠',
    name: 'Remediation patch generated',
    duration: 1100,
    logs: [
      { time: '09:14:27', text: 'generating kubectl patch command…' },
      { time: '09:14:27', text: 'PATCH: env[DB_HOST] = postgres-svc.default.svc.cluster.local', cls: 'em' },
      { time: '09:14:27', text: 'patch type: strategic-merge · scope: prod/api-gateway Deployment' },
      { time: '09:14:27', text: '→ handing off to sandbox for validation', cls: 'ok' },
    ],
  },
  {
    id: 's6',
    icon: '📦',
    name: 'Daytona sandbox validates patch',
    tag: { label: 'sandbox', cls: 'tag-sandbox' },
    duration: 1600,
    logs: [
      { time: '09:14:28', text: 'Claude → call_tool(daytona, run_code, patch.sh)' },
      { time: '09:14:28', text: 'dry-run: kubectl apply --dry-run=server  →  valid', cls: 'em' },
      { time: '09:14:28', text: 'yaml schema: ok · image pull: ok · resource quotas: ok' },
      { time: '09:14:29', text: '→ patch validated in Daytona sandbox ✓', cls: 'ok' },
    ],
  },
  {
    id: 's7',
    icon: '🧪',
    name: 'Fix tested in sentinel-sandbox namespace',
    tag: { label: 'k8s test', cls: 'tag-k8stest' },
    duration: 2200,
    logs: [
      { time: '09:14:30', text: 'Claude → call_tool(k8s-sandbox, kubectl_apply, ns=sentinel-sandbox)' },
      { time: '09:14:30', text: 'replica pod launched in isolated namespace…', cls: 'em' },
      { time: '09:14:32', text: 'pod/api-gateway-test  →  Running (0 restarts)' },
      { time: '09:14:32', text: '→ pod healthy in sandbox K8s namespace ✓', cls: 'ok' },
    ],
  },
  {
    id: 's8',
    icon: '⏸',
    name: 'Approval gate — pause before irreversible',
    tag: { label: 'pause', cls: 'tag-pause' },
    duration: 900,
    isGate: true,
    logs: [
      { time: '09:14:33', text: 'ConsoleApprovalHandler: PAUSING — action is irreversible', cls: 'warn' },
      { time: '09:14:33', text: 'ACTION: patch prod Deployment api-gateway with env DB_HOST', cls: 'em' },
      { time: '09:14:33', text: 'waiting for human decision…' },
    ],
  },
  {
    id: 's9',
    icon: '🚀',
    name: 'Fix applied to production',
    duration: 1800,
    logs: [
      { time: '09:14:41', text: 'Human approved — applying patch to prod cluster', cls: 'em' },
      { time: '09:14:41', text: 'Claude → call_tool(k8s-prod, kubectl_patch, deployment/api-gateway)' },
      { time: '09:14:42', text: 'rollout status: deployment "api-gateway" successfully rolled out' },
      { time: '09:14:43', text: 'pod/api-gateway-8c2d1f  →  Running  (0 restarts) ✓', cls: 'ok' },
    ],
  },
]

const DENIED_S9: StageConfig = {
  ...STAGES[8],
  icon: '🔒',
  name: 'Production untouched — manual review required',
  logs: [
    { time: '09:14:41', text: 'Human denied — production patch NOT applied', cls: 'warn' },
    { time: '09:14:41', text: 'incident logged · on-call notified' },
    { time: '09:14:41', text: '→ pod remains in CrashLoopBackOff (manual intervention required)', cls: 'err' },
  ],
}

type StageState = 'pending' | 'active' | 'done'

export function Pipeline({ phase, onPhaseChange }: PipelineProps) {
  const [stageStates, setStageStates] = useState<StageState[]>(STAGES.map(() => 'pending'))
  const [showGate, setShowGate] = useState(false)
  const [denied, setDenied] = useState(false)
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  // Reset when phase goes back to idle
  useEffect(() => {
    if (phase === 'idle') {
      setStageStates(STAGES.map(() => 'pending'))
      setShowGate(false)
      setDenied(false)
    }
  }, [phase])

  // Start pipeline when phase becomes 'running'
  useEffect(() => {
    if (phase !== 'running') return
    runStage(0)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase])

  function runStage(idx: number) {
    if (idx >= STAGES.length) return

    setStageStates((prev) => {
      const next = [...prev]
      next[idx] = 'active'
      return next
    })

    const stage = STAGES[idx]

    if (stage.isGate) {
      timerRef.current = setTimeout(() => {
        setShowGate(true)
        onPhaseChange('gate')
      }, stage.duration)
    } else {
      timerRef.current = setTimeout(() => {
        setStageStates((prev) => {
          const next = [...prev]
          next[idx] = 'done'
          return next
        })
        if (idx + 1 < STAGES.length) {
          setTimeout(() => runStage(idx + 1), 350)
        } else {
          onPhaseChange('done')
        }
      }, stage.duration)
    }
  }

  function handleDecision(choice: 'approve' | 'deny') {
    setShowGate(false)
    setStageStates((prev) => {
      const next = [...prev]
      next[7] = 'done'
      return next
    })

    if (choice === 'deny') {
      setDenied(true)
      onPhaseChange('denied')
      setTimeout(() => {
        setStageStates((prev) => {
          const next = [...prev]
          next[8] = 'active'
          return next
        })
        setTimeout(() => {
          setStageStates((prev) => {
            const next = [...prev]
            next[8] = 'done'
            return next
          })
          onPhaseChange('done')
        }, 1800)
      }, 350)
    } else {
      onPhaseChange('approved')
      setTimeout(() => runStage(8), 350)
    }
  }

  if (phase === 'idle') return null

  const effectiveStages = denied
    ? [...STAGES.slice(0, 8), DENIED_S9]
    : STAGES

  return (
    <div className="pipeline-section">
      <div className="pipeline-header">
        <span className="pipeline-title">Agent Run</span>
        <span className="pipeline-run-id">run_id: r_7f3a91c</span>
      </div>

      <div className="pipeline">
        {effectiveStages.map((stage, idx) => {
          const state = stageStates[idx]
          const isLastStage = idx === effectiveStages.length - 1
          const isPause = stage.isGate

          return (
            <div
              key={stage.id}
              className={`stage ${state === 'active' ? 'stage-active' : ''} ${state === 'done' ? 'stage-done' : ''} ${isPause && state === 'active' ? 'stage-pause' : ''}`}
            >
              <div className="connector-col">
                <div className="stage-icon">{stage.icon}</div>
                {!isLastStage && <div className="line-segment" />}
              </div>

              <div className="stage-body">
                <div className="stage-header-row">
                  <span className="stage-name">{stage.name}</span>
                  {stage.tag && (
                    <span className={`stage-tag ${stage.tag.cls}`}>{stage.tag.label}</span>
                  )}
                  <span className="stage-status-icon">
                    {state === 'active' && <span className="spinner" />}
                    {state === 'done' && <span className="tick">✓</span>}
                  </span>
                </div>

                {(state === 'active' || state === 'done') && (
                  <div className={`stage-log ${state === 'done' && !isPause ? 'stage-log-done' : ''} ${isPause && state === 'active' ? 'stage-log-pause' : ''} ${isPause && state === 'done' ? 'stage-log-done' : ''}`}>
                    {stage.logs.map((log, i) => (
                      <div key={i} className="log-line" style={{ animationDelay: `${i * 0.15}s` }}>
                        <span className="log-time">{log.time}</span>
                        <span className={`log-text ${log.cls ?? ''}`}>{log.text}</span>
                      </div>
                    ))}
                  </div>
                )}

                {showGate && idx === 7 && (
                  <div className="approval-gate">
                    <div className="gate-prompt">
                      Apply patch to <strong>prod/api-gateway</strong> Deployment?
                      <br />
                      <span className="gate-code">env DB_HOST = postgres-svc.default.svc.cluster.local</span>
                    </div>
                    <div className="gate-btns">
                      <button className="gate-btn gate-approve" onClick={() => handleDecision('approve')}>
                        [ y ]  Approve
                      </button>
                      <button className="gate-btn gate-deny" onClick={() => handleDecision('deny')}>
                        [ N ]  Deny
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )
        })}
      </div>

      {phase === 'done' && !denied && (
        <div className="result-card">
          <div className="result-top">
            <span className="result-icon">✅</span>
            <div>
              <div className="result-title">Pod Recovered</div>
              <div className="result-subtitle">api-gateway-8c2d1f · prod · Running · 0 restarts</div>
            </div>
          </div>
          <div className="result-stats">
            {[
              { label: 'Total time', value: '21 s', cls: 'blue' },
              { label: 'Root cause', value: 'Missing env var', cls: '' },
              { label: 'Tools called', value: '5', cls: 'blue' },
              { label: 'Decision', value: 'Approved', cls: 'green' },
            ].map((s) => (
              <div key={s.label} className="stat">
                <div className="stat-label">{s.label}</div>
                <div className={`stat-value ${s.cls}`}>{s.value}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {phase === 'done' && denied && (
        <div className="result-card result-denied">
          <div className="result-top">
            <span className="result-icon">🔒</span>
            <div>
              <div className="result-title result-title-denied">Remediation Denied</div>
              <div className="result-subtitle">Production untouched · Incident logged · On-call notified</div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
