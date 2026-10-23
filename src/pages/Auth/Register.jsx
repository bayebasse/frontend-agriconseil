import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Eye, EyeOff } from "lucide-react";

import ErrorMessage from "../../components/ErrorMessage/ErrorMessage";
import { useAuth } from "../../contexts/AuthContext";
import { isValidPersonName, isValidSenegalPhone } from "../../utils/accountValidation";

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    username: "",
    password: "",
    first_name: "",
    last_name: "",
    email: "",
    telephone: "",
    role: "farmer",
  });

  const [error, setError] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const firstNameError = form.first_name && !isValidPersonName(form.first_name)
    ? "Le prénom doit contenir uniquement des lettres."
    : "";
  const lastNameError = form.last_name && !isValidPersonName(form.last_name)
    ? "Le nom doit contenir uniquement des lettres."
    : "";
  const telephoneError = form.telephone.trim() && !isValidSenegalPhone(form.telephone)
    ? "Saisissez un numéro sénégalais valide commençant par 76, 77 ou 78 (9 chiffres, indicatif +221 facultatif)."
    : "";

  async function submit(event) {
    event.preventDefault();
    setError("");

    if (!isValidPersonName(form.first_name)) {
      setError("Le prénom doit contenir uniquement des lettres, espaces, apostrophes ou traits d’union.");
      return;
    }

    if (!isValidPersonName(form.last_name)) {
      setError("Le nom doit contenir uniquement des lettres, espaces, apostrophes ou traits d’union.");
      return;
    }

    if (form.password.length < 8) {
      setError("Le mot de passe doit contenir au moins 8 caractères.");
      return;
    }

    if (form.password !== confirmPassword) {
      setError("Les mots de passe ne correspondent pas.");
      return;
    }

    if (form.telephone.trim() && !isValidSenegalPhone(form.telephone)) {
      setError("Saisissez un numéro sénégalais valide commençant par 76, 77 ou 78 (9 chiffres, indicatif +221 facultatif).");
      return;
    }

    try {
      await register(form);
      navigate("/connexion", {
        state: {
          registrationSuccess: "Votre compte a été créé. Connectez-vous pour accéder à votre espace.",
          username: form.username,
        },
      });
    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <main className="flex min-h-screen flex-col items-start bg-sand p-0">
      <div className="mx-0 grid w-full max-w-7xl overflow-hidden rounded-[10px] border border-earth bg-white shadow-[0_12px_35px_rgba(31,31,27,0.06)] lg:grid-cols-2">
        {/* GAUCHE : FORMULAIRE */}
        <section className="flex items-start justify-start p-6 sm:p-8 lg:p-12">
          <div className="w-full max-w-[520px]">
            <span className="text-xs font-extrabold uppercase tracking-[0.11em] text-primary">
              Agri-Conseil
            </span>

            <h1 className="mt-2 font-display text-[36px] font-medium leading-tight tracking-[-0.045em] text-ink sm:text-[44px]">
              Créer un compte
            </h1>

            <p className="mt-4 text-sm leading-6 text-muted sm:text-base">
              Créez votre compte pour enregistrer et suivre vos cultures.
            </p>

            <div className="mt-5">
              <ErrorMessage message={error} />
            </div>

            <form onSubmit={submit} className="mt-6 flex flex-col gap-3">
              <label className="text-sm font-semibold text-ink">
                Type de compte
                <select
                  value={form.role}
                  onChange={(event) => setForm({ ...form, role: event.target.value })}
                  className="mt-1 w-full rounded-md border border-earth bg-white px-4 py-3 font-normal"
                >
                  <option value="farmer">Agriculteur</option>
                  <option value="buyer">Acheteur</option>
                </select>
              </label>
              <div className="grid gap-3 sm:grid-cols-2">
                <div>
                  <input
                    type="text"
                    name="first_name"
                    placeholder="Prénom"
                    autoComplete="given-name"
                    value={form.first_name}
                    aria-invalid={Boolean(firstNameError)}
                    aria-describedby={firstNameError ? "first-name-error" : undefined}
                    onChange={(event) =>
                      setForm({
                        ...form,
                        first_name: event.target.value,
                      })
                    }
                    className={`w-full rounded-md border bg-white px-4 py-3 outline-none transition focus:border-primary ${firstNameError ? "border-red-600" : "border-earth"}`}
                    required
                  />
                  {firstNameError && (
                    <p id="first-name-error" role="alert" className="mt-1 text-sm text-red-700">
                      {firstNameError}
                    </p>
                  )}
                </div>

                <div>
                  <input
                    type="text"
                    name="last_name"
                    placeholder="Nom"
                    autoComplete="family-name"
                    value={form.last_name}
                    aria-invalid={Boolean(lastNameError)}
                    aria-describedby={lastNameError ? "last-name-error" : undefined}
                    onChange={(event) =>
                      setForm({
                        ...form,
                        last_name: event.target.value,
                      })
                    }
                    className={`w-full rounded-md border bg-white px-4 py-3 outline-none transition focus:border-primary ${lastNameError ? "border-red-600" : "border-earth"}`}
                    required
                  />
                  {lastNameError && (
                    <p id="last-name-error" role="alert" className="mt-1 text-sm text-red-700">
                      {lastNameError}
                    </p>
                  )}
                </div>
              </div>

              <input
                type="email"
                placeholder="Adresse email"
                value={form.email}
                onChange={(event) =>
                  setForm({
                    ...form,
                    email: event.target.value,
                  })
                }
                className="w-full rounded-md border border-earth bg-white px-4 py-3 outline-none transition focus:border-primary"
                required
              />

              <div>
                <input
                  type="tel"
                  name="telephone"
                  placeholder="Téléphone"
                  value={form.telephone}
                  autoComplete="tel"
                  inputMode="tel"
                  pattern="(?:\+221[ .-]?)?(?:76|77|78)(?:[ .-]?[0-9]){7}"
                  title="Numéro sénégalais commençant par 76, 77 ou 78, avec 9 chiffres. L’indicatif +221 est facultatif."
                  aria-invalid={Boolean(telephoneError)}
                  aria-describedby={telephoneError ? "telephone-error" : undefined}
                  onChange={(event) =>
                    setForm({
                      ...form,
                      telephone: event.target.value,
                    })
                  }
                  className={`w-full rounded-md border bg-white px-4 py-3 outline-none transition focus:border-primary ${telephoneError ? "border-red-600" : "border-earth"}`}
                />
                {telephoneError && (
                  <p id="telephone-error" role="alert" className="mt-1 text-sm text-red-700">
                    {telephoneError}
                  </p>
                )}
              </div>

              <input
                type="text"
                name="username"
                placeholder="Nom d'utilisateur"
                value={form.username}
                autoComplete="username"
                onChange={(event) =>
                  setForm({
                    ...form,
                    username: event.target.value,
                  })
                }
                className="w-full rounded-md border border-earth bg-white px-4 py-3 outline-none transition focus:border-primary"
                required
              />

              <label className="relative block">
                <span className="sr-only">Mot de passe</span>
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  placeholder="Mot de passe (8 caractères minimum)"
                  value={form.password}
                  autoComplete="new-password"
                  minLength={8}
                  onChange={(event) =>
                    setForm({
                      ...form,
                      password: event.target.value,
                    })
                  }
                  className="w-full rounded-md border border-earth bg-white px-4 py-3 pr-12 outline-none transition focus:border-primary"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? "Masquer le mot de passe" : "Afficher le mot de passe"}
                  aria-pressed={showPassword}
                  className="absolute inset-y-0 right-3 inline-flex items-center text-muted hover:text-primary"
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </label>

              <label className="relative block">
                <span className="sr-only">Confirmation du mot de passe</span>
                <input
                  type={showConfirmation ? "text" : "password"}
                  name="password_confirmation"
                  placeholder="Confirmer le mot de passe"
                  value={confirmPassword}
                  autoComplete="new-password"
                  minLength={8}
                  onChange={(event) => setConfirmPassword(event.target.value)}
                  className="w-full rounded-md border border-earth bg-white px-4 py-3 pr-12 outline-none transition focus:border-primary"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmation(!showConfirmation)}
                  aria-label={showConfirmation ? "Masquer la confirmation" : "Afficher la confirmation"}
                  aria-pressed={showConfirmation}
                  className="absolute inset-y-0 right-3 inline-flex items-center text-muted hover:text-primary"
                >
                  {showConfirmation ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </label>

              <button
                type="submit"
                className="mt-2 inline-flex w-full items-center justify-center rounded-md border border-primary bg-primary px-5 py-3 font-bold text-white transition hover:opacity-90"
              >
                Créer mon compte
              </button>
            </form>

            <p className="mt-5 text-sm text-muted">
              Déjà un compte ?{" "}
              <Link
                to="/connexion"
                className="font-extrabold text-primary"
              >
                Se connecter
              </Link>
            </p>
          </div>
        </section>

        {/* DROITE : PHOTO */}
        <section className="relative hidden min-h-[650px] lg:block">
          <img
            src="/images/auth-agriculture.jpg"
            alt="Agriculture"
            className="absolute inset-0 h-full w-full object-cover"
          />
        </section>
      </div>
      <div className="mt-auto mb-8 ml-4 pt-8">
        <Link
          to="/"
          className="inline-flex items-center rounded-md border border-primary px-4 py-2 font-semibold text-primary transition hover:bg-primary hover:text-white"
        >
          Retour
        </Link>
      </div>
    </main>
  );
}
