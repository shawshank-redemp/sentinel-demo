import { useState } from 'react'
import { Navbar } from './components/Navbar'
import { Hero } from './components/Hero'
import { ClusterPanel } from './components/ClusterPanel'
import { Pipeline, PipelinePhase } from './components/Pipeline'
import { INITIAL_PODS, Pod } from './data/pods'

export default function App() {
  const [phase, setPhase] = useState<PipelinePhase>('idle')
  const [pods, setPods] = useState<Pod[]>(INITIAL_PODS)

  function handleTrigger() {
    setPhase('running')
  }

  function handlePhaseChange(newPhase: PipelinePhase) {
    setPhase(newPhase)
    if (newPhase === 'done') {
      // Flip the crashing pod to Running in the cluster panel
      setPods((prev) =>
        prev.map((p) =>
          p.name === 'api-gateway-7d4f9b'
            ? { ...p, status: 'Running' as const, restarts: 0 }
            : p
        )
      )
    }
  }

  function handleReplay() {
    setPods(INITIAL_PODS)
    setPhase('idle')
    // Small delay so state resets before pipeline re-mounts
    setTimeout(() => {}, 0)
  }

  return (
    <div className="app">
      <Navbar />

      <main className="main">
        <Hero onTrigger={handleTrigger} phase={phase} />

        <div className="content-grid">
          <div className="left-col">
            <ClusterPanel pods={pods} phase={phase} onTrigger={handleTrigger} />

            {phase === 'done' && (
              <button className="replay-btn" onClick={handleReplay}>
                ↺ replay demo
              </button>
            )}

            <div className="requirements-card">
              <div className="req-title">Hackathon Requirements</div>
              <div className="req-list">
                <div className="req-item req-met">
                  <span className="req-check">✓</span>
                  <div>
                    <div className="req-name">Real tool reached</div>
                    <div className="req-desc">K8s MCP connector calls kubectl on a live Kind cluster</div>
                  </div>
                </div>
                <div className="req-item req-met">
                  <span className="req-check">✓</span>
                  <div>
                    <div className="req-name">Code run in sandbox</div>
                    <div className="req-desc">Daytona executes the patch script in an isolated environment</div>
                  </div>
                </div>
                <div className="req-item req-met">
                  <span className="req-check">✓</span>
                  <div>
                    <div className="req-name">Pause before irreversible</div>
                    <div className="req-desc">ConsoleApprovalHandler blocks until human approves or denies</div>
                  </div>
                </div>
              </div>
            </div>

            <div className="stack-card">
              <div className="stack-title">Tech Stack</div>
              <div className="stack-chips">
                {['Java 21', 'Maven 3.9', 'fabric8 K8s Client', 'TrueForge', 'Claude AI', 'Kind', 'Daytona', 'MCP', 'JUnit 5'].map((t) => (
                  <span key={t} className="stack-chip">{t}</span>
                ))}
              </div>
            </div>
          </div>

          <div className="right-col">
            <Pipeline phase={phase} onPhaseChange={handlePhaseChange} />

            {phase === 'idle' && (
              <div className="pipeline-placeholder">
                <div className="placeholder-icon">⬡</div>
                <div className="placeholder-text">Click "Trigger Sentinel" to watch the agent run</div>
              </div>
            )}
          </div>
        </div>
      </main>

      <footer className="footer">
        <span>Built for TrueForge × Polaris · Build Agents That Act Hackathon · Sept 2026</span>
        <a
          href="https://github.com/shawshank-redemp/k8s-pod-healer"
          target="_blank"
          rel="noopener noreferrer"
        >
          View source →
        </a>
      </footer>
    </div>
  )
}
