import { useState } from "react";
import { Link, Navigate, useNavigate } from "react-router-dom";
import { ArrowRight, BookOpen, Eye, EyeOff } from "lucide-react";
import { useAuth } from "../context/AuthContext.jsx";
import { validateRegistration } from "../utils/validation.js";
import LoadingState from "../components/LoadingState.jsx";

export default function RegisterPage() {
  const { user, loading, register } = useAuth();
  const navigate = useNavigate();
  const [values, setValues] = useState({ name: "", email: "", password: "", confirmPassword: "" });
  const [errors, setErrors] = useState({});
  const [requestError, setRequestError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  if (loading) return <LoadingState label="Loading account..." />;
  if (user) return <Navigate to="/spaces" replace />;
  function change(event) { setValues((current) => ({ ...current, [event.target.name]: event.target.value })); }
  async function submit(event) {
    event.preventDefault();
    const nextErrors = validateRegistration(values);
    setErrors(nextErrors);
    setRequestError("");
    if (Object.keys(nextErrors).length) return;
    setSubmitting(true);
    try {
      await register(values);
      navigate("/spaces", { replace: true });
    } catch (error) {
      setRequestError(error.message || "Your account could not be created.");
    } finally { setSubmitting(false); }
  }

  return (
    <div className="auth-page container">
      <section className="auth-card">
        <Link className="auth-brand" to="/"><span className="brand-mark"><BookOpen size={18} /></span>StudySpot</Link>
        <div className="auth-heading"><span className="eyebrow">Make campus a little easier</span><h1>Create your account</h1><p>Join students sharing useful study-space updates.</p></div>
        <p className="mock-auth-disclaimer">Development-only mock authentication. New accounts are members; moderator access is assigned by the backend in a production setup.</p>
        <form className="form-stack" onSubmit={submit} noValidate>
          <label htmlFor="register-name">Full name</label><input id="register-name" name="name" autoComplete="name" value={values.name} onChange={change} aria-invalid={Boolean(errors.name)} placeholder="Your name" />{errors.name && <span className="field-error">{errors.name}</span>}
          <label htmlFor="register-email">Email address</label><input id="register-email" name="email" type="email" autoComplete="email" value={values.email} onChange={change} aria-invalid={Boolean(errors.email)} placeholder="you@college.edu" />{errors.email && <span className="field-error">{errors.email}</span>}
          <label htmlFor="register-password">Password</label><div className="password-input"><input id="register-password" name="password" type={showPassword ? "text" : "password"} autoComplete="new-password" value={values.password} onChange={change} aria-invalid={Boolean(errors.password)} placeholder="At least 8 characters" /><button className="password-toggle" type="button" aria-label={showPassword ? "Hide password" : "Show password"} onClick={() => setShowPassword((value) => !value)}>{showPassword ? <EyeOff size={17} /> : <Eye size={17} />}</button></div>{errors.password && <span className="field-error">{errors.password}</span>}
          <label htmlFor="register-confirm">Confirm password</label><input id="register-confirm" name="confirmPassword" type="password" autoComplete="new-password" value={values.confirmPassword} onChange={change} aria-invalid={Boolean(errors.confirmPassword)} placeholder="Enter your password again" />{errors.confirmPassword && <span className="field-error">{errors.confirmPassword}</span>}
          {requestError && <p className="form-error" role="alert">{requestError}</p>}
          <button className="button button-primary button-full" type="submit" disabled={submitting}>{submitting ? "Creating account..." : "Create account"} {!submitting && <ArrowRight size={16} />}</button>
        </form>
        <p className="auth-switch">Already have an account? <Link to="/login">Log in</Link></p>
      </section>
    </div>
  );
}
