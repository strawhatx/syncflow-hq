import { ComponentType } from 'react';
import { useTeamAccess } from '../hooks/useTeamAccess';
import { LoadingSpinner } from '@/components/ui/loading';

export const withTeamAccess = <P extends object>(WrappedComponent: ComponentType<P>) => {
    return function WithTeamAccessComponent(props: P) {
        const { isLoading, hasAccess } = useTeamAccess();

        if (isLoading) {
            return <LoadingSpinner />;
        }

        if (!hasAccess) {
            return null; // The hook will handle the redirect
        }

        return <WrappedComponent {...props} />;
    };
}; 