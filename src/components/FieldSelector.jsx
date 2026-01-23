import { useState } from 'react';
import { MapPin, ChevronDown, Plus, Check, Circle } from 'lucide-react';
import { useField } from '../context/FieldContext';

const FieldSelector = () => {
    const [isOpen, setIsOpen] = useState(false);
    const { fields, activeField, switchField, activeFields } = useField();

    return (
        <div className="relative">
            {/* Trigger Button */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="flex items-center gap-1.5 sm:gap-2 px-2 sm:px-3 py-1.5 sm:py-2 bg-surface-elevated rounded-xl border border-white/10 hover:border-white/20 transition-colors min-w-[100px] sm:min-w-[140px]"
            >
                <MapPin className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-cane-green flex-shrink-0" />
                <div className="flex-1 text-left min-w-0">
                    <p className="text-xs sm:text-sm text-white font-medium truncate">{activeField?.name}</p>
                    <p className="text-[9px] sm:text-[10px] text-white/50 hidden sm:block">{activeField?.area}</p>
                </div>
                <ChevronDown className={`w-3.5 h-3.5 sm:w-4 sm:h-4 text-white/50 transition-transform flex-shrink-0 ${isOpen ? 'rotate-180' : ''}`} />
            </button>

            {/* Dropdown */}
            {isOpen && (
                <>
                    {/* Backdrop */}
                    <div
                        className="fixed inset-0 z-40"
                        onClick={() => setIsOpen(false)}
                    />

                    {/* Menu */}
                    <div className="absolute top-full left-0 mt-2 w-64 bg-surface-elevated rounded-xl border border-white/10 shadow-xl z-50 overflow-hidden">
                        <div className="p-2">
                            <p className="text-xs text-white/50 px-2 py-1">Select Field</p>

                            {fields.map((field) => {
                                const isActive = field.id === activeField?.id;
                                const isInactive = field.status === 'inactive';

                                return (
                                    <button
                                        key={field.id}
                                        onClick={() => {
                                            switchField(field.id);
                                            setIsOpen(false);
                                        }}
                                        disabled={isInactive}
                                        className={`w-full flex items-center gap-3 p-2 rounded-lg transition-colors ${isActive
                                            ? 'bg-cane-green/20 text-cane-green'
                                            : isInactive
                                                ? 'opacity-50 cursor-not-allowed'
                                                : 'hover:bg-white/5 text-white'
                                            }`}
                                    >
                                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${isActive ? 'bg-cane-green' : 'bg-white/10'
                                            }`}>
                                            <MapPin className="w-4 h-4 text-white" />
                                        </div>
                                        <div className="flex-1 text-left">
                                            <p className="text-sm font-medium">{field.name}</p>
                                            <p className="text-[10px] text-white/50">{field.area} • {field.crop}</p>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            {isInactive && (
                                                <span className="text-[10px] px-1.5 py-0.5 bg-white/10 rounded text-white/50">
                                                    Inactive
                                                </span>
                                            )}
                                            {isActive ? (
                                                <Check className="w-4 h-4 text-cane-green" />
                                            ) : (
                                                <Circle className="w-3 h-3 text-white/20" />
                                            )}
                                        </div>
                                    </button>
                                );
                            })}
                        </div>

                        {/* Add Field Button */}
                        <div className="border-t border-white/10 p-2">
                            <button
                                onClick={() => {
                                    // In a real app, this would open a modal to add a new field
                                    alert('Add Field functionality - would open configuration modal');
                                    setIsOpen(false);
                                }}
                                className="w-full flex items-center gap-2 p-2 rounded-lg hover:bg-white/5 text-white/60 hover:text-white transition-colors"
                            >
                                <Plus className="w-4 h-4" />
                                <span className="text-sm">Add New Field</span>
                            </button>
                        </div>
                    </div>
                </>
            )}
        </div>
    );
};

export default FieldSelector;
