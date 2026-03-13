interface WizardStepProps {
    currentStep: number;
    totalSteps: number;
    title: string;
    description: string;
    onBack?: () => void;
    children: React.ReactNode;
}

export function WizardStep({
    currentStep,
    totalSteps,
    title,
    description,
    onBack,
    children,
}: WizardStepProps) {
    const progressPercentage = ((currentStep + 1) / totalSteps) * 100;

    return (
        <div className="mx-auto w-full max-w-2xl animate-fade-in">
            {/* Progress Bar - Modern Light Style */}
            <div className="mb-10 group">
                <div className="flex justify-between items-end mb-2">
                    <span className="text-[10px] font-mono font-bold uppercase text-neutral-400 tracking-widest">Avanzamento</span>
                    <span className="text-[10px] font-mono font-bold text-neutral-900">{Math.round(progressPercentage)}%</span>
                </div>
                <div className="h-1 w-full overflow-hidden rounded-full bg-neutral-100 border border-neutral-200">
                    <div
                        className="h-full bg-black transition-all duration-700 ease-out shadow-sm"
                        style={{ width: `${progressPercentage}%` }}
                    />
                </div>
            </div>

            {/* Header */}
            <div className="mb-10 space-y-4">
                <div className="inline-flex px-2 py-0.5 rounded bg-neutral-100 border border-neutral-200">
                    <span className="text-[10px] font-mono font-bold uppercase text-neutral-600 tracking-tighter">
                        Passaggio {currentStep + 1} / {totalSteps}
                    </span>
                </div>
                <h2 className="text-4xl font-semibold text-neutral-900 tracking-tight leading-none">{title}</h2>
                <p className="text-sm text-neutral-500 font-medium max-w-lg leading-relaxed">{description}</p>
            </div>

            {/* Content */}
            <div className="mb-10 animate-slide-up" style={{ animationDelay: '0.1s' }}>
                {children}
            </div>

            {/* Navigation */}
            {onBack && (
                <button
                    type="button"
                    onClick={onBack}
                    className="group flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-neutral-400 hover:text-neutral-900 transition-colors"
                >
                    <span className="group-hover:-translate-x-1 transition-transform">←</span> Indietro
                </button>
            )}
        </div>
    );
}
