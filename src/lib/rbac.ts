export type Participant = 'EDB' | 'National Grid' | 'Retailer' | 'Electricity Authority' | 'Admin';
export type Role = 'admin' | 'controller' | 'viewer';

// Define the permissions for sidebar navigation items based on Participant
const sidebarPermissions: Record<Participant, string[]> = {
    'EDB': ['explorer', 'reporting', 'connections', 'der'],
    'National Grid': ['der'],
    'Retailer': ['der'],
    'Electricity Authority': ['der'],
    'Admin': ['explorer', 'reporting', 'connections', 'der'], // Super admin
};

// Define the permissions for sub-items (e.g., under DER Management)
const subItemPermissions: Record<Participant, string[]> = {
    'EDB': ['der-controllable-load', 'der-plan-developer'],
    'National Grid': ['der-controllable-load', 'der-plan-developer'],
    'Retailer': ['der-controllable-load', 'der-plan-developer'],
    'Electricity Authority': [],
    'Admin': ['der-controllable-load', 'der-plan-developer'],
};

// Define the permissions for tabs within the Explorer view
const tabPermissions: Record<Participant, string[]> = {
    'EDB': ['overview', 'map', 'alerts', 'anomaly', 'reporting'],
    'National Grid': [], // No explorer tabs for these roles
    'Retailer': [],
      'Electricity Authority': [],
    'Admin': ['overview', 'map', 'alerts', 'anomaly', 'reporting'],
};

export const hasPermission = (participant: Participant, type: 'sidebar' | 'subItem' | 'tab', key: string): boolean => {
    switch (type) {
        case 'sidebar':
            return sidebarPermissions[participant]?.includes(key) ?? false;
        case 'subItem':
            return subItemPermissions[participant]?.includes(key) ?? false;
        case 'tab':
            return tabPermissions[participant]?.includes(key) ?? false;
        default:
            return false;
    }
};

export const getInitialViewForParticipant = (participant: Participant): string => {
    // Return the first sidebar item the user has access to
    return sidebarPermissions[participant]?.[0] || 'explorer';
};
