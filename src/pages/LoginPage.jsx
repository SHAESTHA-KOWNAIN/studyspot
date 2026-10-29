import { useState } from "react";
import { Link, Navigate, useLocation, useNavigate } from "react-router-dom";
import { ArrowRight, BookOpen, Eye, EyeOff } from "lucide-react";
import { useAuth } from "../context/AuthContext.jsx";
import { validateLogin } from "../utils/validation.js";
import LoadingState from "../components/LoadingState.jsx";

export default function LoginPage() {
  const { user, loading, login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [values, setValues] = useState({ email: "", password: "" });
  const [errors, setErrors] = useState({});
  const [requestError, setRequestError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  if (loading) return <LoadingState label="Loading account..." />;
  if (user) return <Navigate to="/spaces" replace />;
  function change(event) { setValues((current) => ({ ...current, [event.target.name]: event.target.value })); }
  async function submit(event) {
    event.preventDefault();
    const nextErrors = validateLogin(values);
    setErrors(nextErrors);
    setRequestError("");
    if (Object.keys(nextErrors).length) return;
    setSubmitting(true);
    try {
      await login(values);
      navigate(location.state?.from?.pathname || "/spaces", { replace: true });
    } catch (error) {
      setRequestError(error.message || "We could not sign you in. Please try again.");
    } finally { setSubmitting(false); }
  }

  return (
    <div className="auth-page container">
      <section className="auth-card">
        <Link className="auth-brand" to="/"><span className="brand-mark"><BookOpen size={18} /></span>StudySpot</Link>
        <div className="auth-heading"><span className="eyebrow">Welcome back</span><h1>Log in to StudySpot</h1><p>Sign in to share an update or manage your spaces.</p></div>
        <div className="demo-notice"><strong>Development-only demo accounts</strong><span>student@studyspot.demo or moderator@studyspot.demo</span><span>Password: <code>StudySpot123!</code></span><small>Mock authentication is for local development only and is not secure.</small></div>
        <form className="form-stack" onSubmit={submit} noValidate>
          <label htmlFor="login-email">Email address</label><input id="login-email" name="email" type="email" autoComplete="email" value={values.email} onChange={change} aria-invalid={Boolean(errors.email)} aria-describedby={errors.email ? "login-email-error" : undefined} placeholder="you@college.edu" />{errors.email && <span className="field-error" id="login-email-error">{errors.email}</span>}
          <label htmlFor="login-password">Password</label><div className="password-input"><input id="login-password" name="password" type={showPassword ? "text" : "password"} autoComplete="current-password" value={values.password} onChange={change} aria-invalid={Boolean(errors.password)} aria-describedby={errors.password ? "login-password-error" : undefined} placeholder="Enter your password" /><button className="password-toggle" type="button" aria-label={showPassword ? "Hide password" : "Show password"} onClick={() => setShowPassword((value) => !value)}>{showPassword ? <EyeOff size={17} /> : <Eye size={17} />}</button></div>{errors.password && <span className="field-error" id="login-password-error">{errors.password}</span>}
          {requestError && <p className="form-error" role="alert">{requestError}</p>}
          <button className="button button-primary button-full" type="submit" disabled={submitting}>{submitting ? "Signing in..." : "Log in"} {!submitting && <ArrowRight size={16} />}</button>
        </form>
        <p className="auth-switch">New to StudySpot? <Link to="/register">Create an account</Link></p>
      </section>
    </div>
  );
}
