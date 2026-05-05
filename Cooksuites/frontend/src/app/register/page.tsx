import Link from 'next/link';
import { RegisterForm } from '@/components/auth/RegisterForm';
import { AuthSplitLayout } from '@/components/auth/AuthSplitLayout';

export default function RegisterPage() {
  return (
    <AuthSplitLayout
      title="Create your workspace"
      subtitle="Join culinary professionals using CookSuite to manage recipes and operations."
      leftTitle="CookSuite"
      leftDescription="Build your kitchen workspace with tools for recipes, cookbooks, and weekly planning."
      footer={(
        <p className="font-body-md text-body-md text-on-surface-variant">
          Already have an account? <Link className="text-primary font-semibold hover:underline" href="/login">Sign in</Link>
        </p>
      )}
    >
      <RegisterForm />
    </AuthSplitLayout>
  );
}
