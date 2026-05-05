'use client';

import React from 'react';
import { usePermission } from '@/hooks/usePermission';

interface PermissionGuardProps {
  permission: string;
  fallback?: React.ReactNode;
  showDisabled?: boolean;
  children: React.ReactNode;
}

/**
 * Wrapper component to conditionally render based on permission
 * @param permission - Permission string to check
 * @param fallback - What to show if no permission (default: null)
 * @param showDisabled - If true, disable child instead of hiding
 * @param children - Component to render if permission exists
 */
export function PermissionGuard({ 
  permission, 
  fallback = null, 
  showDisabled = false,
  children 
}: PermissionGuardProps) {
  const hasPermission = usePermission(permission);

  // If no permission and showDisabled, clone element with disabled prop
  if (!hasPermission && showDisabled && React.isValidElement(children)) {
    return React.cloneElement(children as React.ReactElement<any>, { 
      disabled: true,
      title: "You don't have permission to perform this action"
    });
  }

  // If no permission, show fallback or hide
  if (!hasPermission) {
    return <>{fallback}</>;
  }

  // Has permission, render normally
  return <>{children}</>;
}
