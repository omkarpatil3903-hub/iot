import { useState } from 'react';
import { Home, TrendingUp, Cloud, BarChart3, ChevronDown, ChevronUp } from 'lucide-react';

const TabNavigation = ({ activeTab, onTabChange, children }) => {
    const tabs = [
        { id: 'overview', label: 'Overview', icon: Home, badge: null },
        { id: 'analytics', label: 'Analytics', icon: TrendingUp, badge: null },
        { id: 'weather', label: 'Weather', icon: Cloud, badge: null },
        { id: 'history', label: 'History', icon: BarChart3, badge: null }
    ];

    return (
        <div className="w-full">
            {/* Tab Navigation */}
            <div className="sticky top-0 z-40 bg-surface-dark/95 backdrop-blur-lg border-b border-white/10 mb-6">
                <div className="flex items-center gap-2 overflow-x-auto scrollbar-hide px-4 sm:px-0">
                    {tabs.map((tab) => {
                        const Icon = tab.icon;
                        const isActive = activeTab === tab.id;

                        return (
                            <button
                                key={tab.id}
                                onClick={() => onTabChange(tab.id)}
                                className={`flex items-center gap-2 px-4 py-3 border-b-2 transition-all duration-300 whitespace-nowrap ${isActive
                                        ? 'border-cane-green text-cane-green bg-cane-green/10'
                                        : 'border-transparent text-white/50 hover:text-white/80 hover:bg-white/5'
                                    }`}
                            >
                                <Icon className={`w-4 h-4 ${isActive ? 'animate-pulse' : ''}`} />
                                <span className="text-sm font-medium">{tab.label}</span>
                                {tab.badge && (
                                    <span className="px-1.5 py-0.5 text-xs bg-red-500/20 text-red-400 rounded-full">
                                        {tab.badge}
                                    </span>
                                )}
                            </button>
                        );
                    })}
                </div>
            </div>

            {/* Tab Content */}
            <div className="animate-fadeIn">
                {children}
            </div>
        </div>
    );
};

export const CollapsibleSection = ({ title, icon, defaultOpen = true, badge, children }) => {
    const [isOpen, setIsOpen] = useState(defaultOpen);

    return (
        <div className="mb-6">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="w-full flex items-center justify-between p-4 bg-surface-card rounded-t-2xl border border-white/10 hover:bg-surface-elevated transition-colors group"
            >
                <div className="flex items-center gap-3">
                    {icon && <div className="text-cane-green">{icon}</div>}
                    <h2 className="text-sm font-medium text-white/70 group-hover:text-white transition-colors">
                        {title}
                    </h2>
                    {badge && (
                        <span className="px-2 py-0.5 text-xs bg-cane-green/20 text-cane-green rounded-full">
                            {badge}
                        </span>
                    )}
                </div>
                <div className="flex items-center gap-2">
                    <span className="text-xs text-white/40">
                        {isOpen ? 'Collapse' : 'Expand'}
                    </span>
                    {isOpen ? (
                        <ChevronUp className="w-4 h-4 text-white/50" />
                    ) : (
                        <ChevronDown className="w-4 h-4 text-white/50" />
                    )}
                </div>
            </button>

            {isOpen && (
                <div className="p-4 bg-surface-card rounded-b-2xl border-x border-b border-white/10 animate-slideDown">
                    {children}
                </div>
            )}
        </div>
    );
};

export default TabNavigation;
