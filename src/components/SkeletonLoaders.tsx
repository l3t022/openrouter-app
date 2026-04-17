export function SkeletonLoader({ className }: { className?: string }) {
  return (
    <div
      className={className}
      style={{
        background: 'linear-gradient(90deg, rgba(255,255,255,0.05) 25%, rgba(255,255,255,0.1) 50%, rgba(255,255,255,0.05) 75%)',
        backgroundSize: '200% 100%',
        animation: 'skeleton-pulse 1.5s ease-in-out infinite',
        borderRadius: '8px',
      }}
    />
  );
}

export function ChatSkeleton() {
  return (
    <div style={{ padding: '1rem', marginBottom: '1rem', maxWidth: '85%' }}>
      <SkeletonLoader style={{ height: '1rem', width: '60px', marginBottom: '0.5rem' }} />
      <SkeletonLoader style={{ height: '3rem', width: '100%' }} />
    </div>
  );
}

export function ModelPickerSkeleton() {
  return (
    <div style={{ marginBottom: '1.5rem' }}>
      <SkeletonLoader style={{ height: '1rem', width: '120px', marginBottom: '0.5rem' }} />
      <SkeletonLoader style={{ height: '42px', width: '100%' }} />
    </div>
  );
}

export function SettingsSkeleton() {
  return (
    <div style={{ padding: '1.5rem' }}>
      <SkeletonLoader style={{ height: '1.5rem', width: '100px', marginBottom: '1rem' }} />
      <SkeletonLoader style={{ height: '42px', width: '100%', marginBottom: '1rem' }} />
      <SkeletonLoader style={{ height: '1.25rem', width: '150px', marginBottom: '0.75rem' }} />
      <ModelPickerSkeleton />
      <ModelPickerSkeleton />
      <ModelPickerSkeleton />
      <ModelPickerSkeleton />
      <SkeletonLoader style={{ height: '42px', width: '100%', marginTop: '1rem' }} />
    </div>
  );
}