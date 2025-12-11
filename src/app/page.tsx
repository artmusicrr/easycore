export default function Home() {
  return (
    <main style={{ 
      display: 'flex', 
      flexDirection: 'column', 
      alignItems: 'center', 
      justifyContent: 'center', 
      minHeight: '100vh',
      fontFamily: 'system-ui, sans-serif'
    }}>
      <h1>🦷 EasyCore API</h1>
      <p>Backend para gerenciamento odontológico</p>
      <div style={{ marginTop: '2rem' }}>
        <p><strong>Status:</strong> Operacional</p>
        <p><strong>Versão:</strong> 1.0.0</p>
      </div>
      <div style={{ marginTop: '2rem', textAlign: 'left' }}>
        <h3>Endpoints disponíveis:</h3>
        <ul>
          <li>GET /api/health</li>
          <li>POST /api/users/register</li>
          <li>POST /api/auth/login</li>
          <li>GET/POST /api/patients</li>
          <li>GET/POST /api/treatments</li>
          <li>GET /api/treatments/:id</li>
          <li>POST /api/payments</li>
          <li>GET /api/payments/:treatmentId</li>
        </ul>
      </div>
    </main>
  )
}
