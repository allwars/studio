'use client';

import { useAuth } from '@/hooks/use-auth';
import { useRouter, usePathname } from 'next/navigation';
import { useEffect, ComponentType } from 'react';
import LoadingSpinner from '@/components/loading-spinner';

const withAuth = <P extends object>(WrappedComponent: ComponentType<P>) => {
  const ComponentWithAuth = (props: P) => {
    const { user, loading } = useAuth();
    const router = useRouter();
    const pathname = usePathname();

    useEffect(() => {
      if (!loading && !user) {
        const lang = pathname.split('/')[1] || 'es';
        router.replace(`/${lang}`);
      }
    }, [user, loading, router, pathname]);

    if (loading || !user) {
      return (
        <div className="flex h-screen w-full items-center justify-center">
            <LoadingSpinner />
        </div>
      );
    }

    return <WrappedComponent {...props} />;
  };

  return ComponentWithAuth;
};

export default withAuth;
