import { Link, Navigate, useLocation, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { loginSchema } from "@/schemas/auth";
import { useAuthStore } from "@/store/useAuthStore";
import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";

export default function Login() {
  const { user, loading, signIn } = useAuthStore();
  const navigate = useNavigate();
  const location = useLocation();
  const dest = location.state?.from?.pathname || "/dashboard";

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({ resolver: zodResolver(loginSchema) });

  if (!loading && user) return <Navigate to={dest} replace />;

  const onSubmit = async (values) => {
    try {
      await signIn(values);
      navigate(dest, { replace: true });
    } catch (e) {
      toast.error(e.message);
    }
  };

  return (
    <div className="grid min-h-screen place-items-center px-4">
      <div className="card w-full max-w-sm">
        <h1 className="text-2xl font-extrabold">Welcome back</h1>
        <p className="mb-6 mt-1 text-sm text-ink/60">Log in to see your spending.</p>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
          <Input label="Email" type="email" autoComplete="email" error={errors.email?.message} {...register("email")} />
          <Input label="Password" type="password" autoComplete="current-password" error={errors.password?.message} {...register("password")} />
          <Button type="submit" loading={isSubmitting} className="w-full">Log in</Button>
        </form>
        <p className="mt-5 text-center text-sm text-ink/60">
          New here? <Link to="/register" className="font-semibold text-olive underline">Create an account</Link>
        </p>
      </div>
    </div>
  );
}
