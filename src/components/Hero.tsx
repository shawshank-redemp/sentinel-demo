interface HeroProps {
  onTrigger: () => void
  phase: string
}

export function Hero({ onTrigger, phase }: HeroProps) {
  const idle = phase === 'idle'

  return (
    <div className="hero">
      <div className="hero-badges">
        <span className="badge badge-hackathon">🏆 TrueForge × Polaris Hackathon</span>
        <span className="badge badge-java">Java 21</span>
        <span className="badge badge-k8s">Kubernetes</span>
        <span className="badge badge-claude">Claude AI</span>
        <span className="badge badge-trueforge">TrueForge</span>
      </div>

      <h1 className="hero-title">
        Autonomous K8s<br />
        <span className="hero-title-accent">Pod Remediation</span>
      </h1>

      <p className="hero-desc">
        Sentinel watches your cluster 24/7. When a pod crashes, it detects the failure,
        calls real Kubernetes tools via MCP, diagnoses root cause with Claude AI,
        validates a fix in sandbox — then pauses for your approval before touching production.
      </p>

      <div className="hero-stats">
        <div className="hero-stat">
          <span className="hero-stat-value">38/38</span>
          <span className="hero-stat-label">Tests passing</span>
        </div>
        <div className="hero-stat-divider" />
        <div className="hero-stat">
          <span className="hero-stat-value">&lt; 30s</span>
          <span className="hero-stat-label">Detection to fix</span>
        </div>
        <div className="hero-stat-divider" />
        <div className="hero-stat">
          <span className="hero-stat-value">3/3</span>
          <span className="hero-stat-label">Hackathon requirements</span>
        </div>
      </div>

      {idle && (
        <button className="trigger-btn" onClick={onTrigger}>
          <span className="trigger-btn-dot" />
          Trigger Sentinel on failing pod
        </button>
      )}
    </div>
  )
}
