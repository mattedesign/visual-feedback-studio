
export const TroubleshootingGuide = () => {
  return (
    <div className="text-xs text-slate-500 space-y-2">
      <p><strong>💡 Quick Troubleshooting:</strong></p>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs">
        <div className="space-y-1">
          <p>🔑 <strong>API Key Issues:</strong></p>
          <ul className="list-disc list-inside space-y-1 ml-2 text-slate-600">
            <li>OpenAI keys start with "sk-"</li>
            <li>Claude keys start with "sk-ant-"</li>
            <li>Ensure keys are active and have credits</li>
            <li>Check for extra spaces or characters</li>
          </ul>
        </div>
        <div className="space-y-1">
          <p>⚡ <strong>Model-Specific:</strong></p>
          <ul className="list-disc list-inside space-y-1 ml-2 text-slate-600">
            <li>Test Mode provides detailed logs</li>
            <li>Auto selection uses fallback providers</li>
            <li>Specific models may need higher API limits</li>
            <li>Check provider model availability</li>
          </ul>
        </div>
      </div>
    </div>
  );
};
