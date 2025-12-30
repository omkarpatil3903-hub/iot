import { createContext, useContext, useState, useEffect } from 'react';

const FieldContext = createContext(null);

// Default fields configuration
const DEFAULT_FIELDS = [
    {
        id: 'field-1',
        name: 'North Plot',
        area: '2.5 acres',
        crop: 'Sugarcane',
        plantingDate: '2025-09-15',
        firebasePath: 'fields/north',
        status: 'active'
    },
    {
        id: 'field-2',
        name: 'South Plot',
        area: '3.0 acres',
        crop: 'Sugarcane',
        plantingDate: '2025-10-01',
        firebasePath: 'fields/south',
        status: 'active'
    },
    {
        id: 'field-3',
        name: 'East Plot',
        area: '1.8 acres',
        crop: 'Sugarcane',
        plantingDate: '2025-08-20',
        firebasePath: 'fields/east',
        status: 'inactive'
    }
];

export const FieldProvider = ({ children }) => {
    const [fields, setFields] = useState(DEFAULT_FIELDS);
    const [activeFieldId, setActiveFieldId] = useState(() => {
        if (typeof window !== 'undefined') {
            return localStorage.getItem('sugarcane-active-field') || 'field-1';
        }
        return 'field-1';
    });

    // Get active field object
    const activeField = fields.find(f => f.id === activeFieldId) || fields[0];

    // Persist active field selection
    useEffect(() => {
        localStorage.setItem('sugarcane-active-field', activeFieldId);
    }, [activeFieldId]);

    // Switch to a different field
    const switchField = (fieldId) => {
        const field = fields.find(f => f.id === fieldId);
        if (field) {
            setActiveFieldId(fieldId);
        }
    };

    // Add a new field
    const addField = (fieldData) => {
        const newField = {
            id: `field-${Date.now()}`,
            status: 'active',
            ...fieldData
        };
        setFields(prev => [...prev, newField]);
        return newField;
    };

    // Update field data
    const updateField = (fieldId, updates) => {
        setFields(prev => prev.map(field =>
            field.id === fieldId ? { ...field, ...updates } : field
        ));
    };

    // Remove a field
    const removeField = (fieldId) => {
        setFields(prev => prev.filter(f => f.id !== fieldId));
        if (activeFieldId === fieldId && fields.length > 1) {
            setActiveFieldId(fields.find(f => f.id !== fieldId)?.id);
        }
    };

    // Get field by ID
    const getField = (fieldId) => fields.find(f => f.id === fieldId);

    // Get active fields only
    const activeFields = fields.filter(f => f.status === 'active');

    const value = {
        fields,
        activeField,
        activeFieldId,
        activeFields,
        switchField,
        addField,
        updateField,
        removeField,
        getField
    };

    return (
        <FieldContext.Provider value={value}>
            {children}
        </FieldContext.Provider>
    );
};

export const useField = () => {
    const context = useContext(FieldContext);
    if (!context) {
        throw new Error('useField must be used within a FieldProvider');
    }
    return context;
};

export default FieldContext;
