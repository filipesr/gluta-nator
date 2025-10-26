'use client';

export default function ConfigWarning() {
  return (
    <div className="card">
      <h2>Configuração do Firebase pendente</h2>
      <p className="muted">
        Adicione as credenciais do seu projeto Firebase (Realtime Database) no arquivo
        <code>.env.local</code> antes de usar o painel. O passo a passo está documentado no
        README.
      </p>
    </div>
  );
}
