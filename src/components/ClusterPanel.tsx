import { Pod, PodStatus } from '../data/pods'

interface ClusterPanelProps {
  pods: Pod[]
  phase: string
  onTrigger: () => void
}

const STATUS_CONFIG: Record<PodStatus, { label: string; className: string }> = {
  Running: { label: 'Running', className: 'status-running' },
  CrashLoopBackOff: { label: 'CrashLoopBackOff', className: 'status-crash' },
  Pending: { label: 'Pending', className: 'status-pending' },
  Completed: { label: 'Completed', className: 'status-completed' },
}

export function ClusterPanel({ pods, phase, onTrigger }: ClusterPanelProps) {
  const idle = phase === 'idle'
  const done = phase === 'done'

  return (
    <div className="cluster-panel">
      <div className="cluster-header">
        <div className="cluster-header-left">
          <span className="cluster-label">cluster</span>
          <span className="cluster-value">kind-sentinel-dev</span>
          <span className="cluster-sep">·</span>
          <span className="cluster-label">ns</span>
          <span className="cluster-value">production</span>
        </div>
        <div className="cluster-watching">
          <span className="watching-dot" />
          watching
        </div>
      </div>

      <table className="pods-table">
        <thead>
          <tr>
            <th>POD</th>
            <th>STATUS</th>
            <th>RESTARTS</th>
            <th>AGE</th>
          </tr>
        </thead>
        <tbody>
          {pods.map((pod) => (
            <tr
              key={pod.name}
              className={`pod-row ${pod.status === 'CrashLoopBackOff' && !done ? 'pod-row-failing' : ''} ${pod.status === 'Running' && done && pod.name === 'api-gateway-7d4f9b' ? 'pod-row-recovered' : ''}`}
            >
              <td className="pod-name">
                <span className="pod-name-text">{pod.name}</span>
                {pod.status === 'CrashLoopBackOff' && !done && (
                  <span className="pod-alert-icon">⚠</span>
                )}
                {done && pod.name === 'api-gateway-7d4f9b' && (
                  <span className="pod-ok-icon">✓</span>
                )}
              </td>
              <td>
                <span className={`status-badge ${STATUS_CONFIG[pod.status].className}`}>
                  {STATUS_CONFIG[pod.status].label}
                </span>
              </td>
              <td className="pod-restarts">
                <span className={pod.restarts > 0 && !done ? 'restarts-high' : ''}>
                  {pod.name === 'api-gateway-7d4f9b' && done ? 0 : pod.restarts}
                </span>
              </td>
              <td className="pod-age">{pod.age}</td>
            </tr>
          ))}
        </tbody>
      </table>

      {idle && (
        <div className="cluster-footer">
          <div className="cluster-alert">
            <span className="alert-icon">⚠</span>
            <span className="alert-text">
              <strong>api-gateway-7d4f9b</strong> is in CrashLoopBackOff — 4 restarts detected
            </span>
            <button className="trigger-btn-sm" onClick={onTrigger}>
              Trigger Sentinel →
            </button>
          </div>
        </div>
      )}

      {phase !== 'idle' && phase !== 'done' && (
        <div className="cluster-footer">
          <div className="cluster-running">
            <span className="running-spinner" />
            Sentinel agent is diagnosing the failure…
          </div>
        </div>
      )}

      {done && (
        <div className="cluster-footer">
          <div className="cluster-recovered">
            <span>✅</span>
            <span><strong>api-gateway</strong> recovered — patch applied to production</span>
          </div>
        </div>
      )}
    </div>
  )
}
