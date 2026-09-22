import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import ErrorMessage from "../../components/ErrorMessage/ErrorMessage";
import { useAuth } from "../../contexts/AuthContext";

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
  });

  const [error, setError] = useState("");

  async function submit(event) {
    event.preventDefault();
    setError("");

    try {
      await register(form);
      navigate("/dashboard");
    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <main className="min-h-[72vh] bg-sand px-3 py-8 sm:px-5 lg:py-[70px]">
      <div className="mx-auto grid max-w-7xl overflow-hidden rounded-[10px] border border-earth bg-white shadow-[0_12px_35px_rgba(31,31,27,0.06)] lg:grid-cols-2">
        {/* GAUCHE : FORMULAIRE */}
        <section className="flex items-center justify-center p-6 sm:p-8 lg:p-12">
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
              <div className="grid gap-3 sm:grid-cols-2">
                <input
                  type="text"
                  placeholder="Prénom"
                  value={form.first_name}
                  onChange={(event) =>
                    setForm({
                      ...form,
                      first_name: event.target.value,
                    })
                  }
                  className="w-full rounded-md border border-earth bg-white px-4 py-3 outline-none transition focus:border-primary"
                  required
                />

                <input
                  type="text"
                  placeholder="Nom"
                  value={form.last_name}
                  onChange={(event) =>
                    setForm({
                      ...form,
                      last_name: event.target.value,
                    })
                  }
                  className="w-full rounded-md border border-earth bg-white px-4 py-3 outline-none transition focus:border-primary"
                  required
                />
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

              <input
                type="tel"
                placeholder="Téléphone"
                value={form.telephone}
                onChange={(event) =>
                  setForm({
                    ...form,
                    telephone: event.target.value,
                  })
                }
                className="w-full rounded-md border border-earth bg-white px-4 py-3 outline-none transition focus:border-primary"
              />

              <input
                type="text"
                placeholder="Nom d'utilisateur"
                value={form.username}
                onChange={(event) =>
                  setForm({
                    ...form,
                    username: event.target.value,
                  })
                }
                className="w-full rounded-md border border-earth bg-white px-4 py-3 outline-none transition focus:border-primary"
                required
              />

              <input
                type="password"
                placeholder="Mot de passe"
                value={form.password}
                onChange={(event) =>
                  setForm({
                    ...form,
                    password: event.target.value,
                  })
                }
                className="w-full rounded-md border border-earth bg-white px-4 py-3 outline-none transition focus:border-primary"
                required
              />

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
    </main>
  );
}