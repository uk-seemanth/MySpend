import { Link, Navigate, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { registerSchema } from "@/schemas/auth";
import { useAuthStore } from "@/store/useAuthStore";
import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";

export default function Register() {
  const { user, loading, signUp, fetchProfile } = useAuthStore();
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({ resolver: zodResolver(registerSchema) });

  if (!loading && user) return <Navigate to="/dashboard" replace />;

  const onSubmit = async (values) => {
    try {
      const data = await signUp(values);
      if (data.session) {
        await fetchProfile();
        navigate("/dashboard", { replace: true });
      } else {
        toast.success("Check your email to confirm your account. Confirm your email, then log in.");
        navigate("/login", { replace: true });
      }
    } catch (e) {
      toast.error(e.message);
    }
  };

  return (
    <div className="grid min-h-screen place-items-center px-4">
      <div className="card w-full max-w-sm">
        <h1 className="text-2xl font-extrabold">Create your account</h1>
        <p className="mb-6 mt-1 text-sm text-ink/60">It takes under a minute.</p>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
          <Input label="Name" autoComplete="name" error={errors.name?.message} {...register("name")} />
          <Input label="Email" type="email" autoComplete="email" error={errors.email?.message} {...register("email")} />
          <Input label="Password" type="password" autoComplete="new-password" error={errors.password?.message} {...register("password")} />
          <Input label="Confirm password" type="password" autoComplete="new-password" error={errors.confirm?.message} {...register("confirm")} />
          <Button type="submit" loading={isSubmitting} className="w-full">Create account</Button>
        </form>
        <p className="mt-5 text-center text-sm text-ink/60">
          Already have an account? <Link to="/login" className="font-semibold text-olive underline">Log in</Link>
        </p>
      </div>
    </div>
  );
}
