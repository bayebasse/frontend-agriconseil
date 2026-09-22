import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import ErrorMessage from "../../components/ErrorMessage/ErrorMessage";
import { cultureService } from "../../services/cultureService";

const ALLOWED_CROPS = [
  "Riz",
  "Mil",
  "Maïs",
  "Sorgho",
  "Arachide",
  "Niébé",
  "Manioc",
  "Oignon",
  "Mangue",
  "Pastèque",
];

function normalizeText(value) {
  return value
    ?.normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();
}

export default function CreateCulture() {
  const [regions, setRegions] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [communes, setCommunes] = useState([]);
  const [cultures, setCultures] = useState([]);

  const [form, setForm] = useState({
    region: "",
    departement: "",
    commune: "",
    culture: "",
    superficie: "",
    date_semis: "",
    type_sol: "sableux",
  });

  const [communeSearch, setCommuneSearch] = useState("");
  const [showSuggestions, setShowSuggestions] = useState(false);

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  // =========================================================
  // Chargement initial : régions + cultures
  // =========================================================
  useEffect(() => {
    async function loadInitialData() {
      try {
        const [regionData, cultureData] = await Promise.all([
          cultureService.getRegions(),
          cultureService.getCultureReferences(),
        ]);
        console.log("REGIONS =", regionData);
        console.log("CULTURES =", cultureData);

        setRegions(regionData);

        // On ne garde que nos 10 cultures officielles
        const allowedCultures = cultureData.filter((culture) =>
          ALLOWED_CROPS.some(
            (name) =>
              normalizeText(name) === normalizeText(culture.nom)
          )
        );

        setCultures(allowedCultures);
      } catch (err) {
        setError(
          err.message ||
            "Impossible de charger les données du formulaire."
        );
      }
    }

    loadInitialData();
  }, []);

  // =========================================================
  // Chargement des départements selon la région
  // =========================================================
  useEffect(() => {
    async function loadDepartments() {
      if (!form.region) {
        setDepartments([]);
        return;
      }

      try {
        const data = await cultureService.getDepartments(
          form.region
        );

        setDepartments(data);
      } catch (err) {
        setDepartments([]);
        setError(
          err.message ||
            "Impossible de charger les départements."
        );
      }
    }

    loadDepartments();
  }, [form.region]);

  // =========================================================
  // Chargement des communes selon le département
  // =========================================================
  useEffect(() => {
    async function loadCommunes() {
      if (!form.departement) {
        setCommunes([]);
        setCommuneSearch("");
        setShowSuggestions(false);
        return;
      }

      try {
        const data = await cultureService.getCommunes(
          form.departement
        );

        setCommunes(data);
      } catch (err) {
        setCommunes([]);
        setError(
          err.message ||
            "Impossible de charger les communes/localités."
        );
      }
    }

    loadCommunes();
  }, [form.departement]);

  // =========================================================
  // Changement de région
  // =========================================================
  function handleRegionChange(event) {
    const regionId = event.target.value;

    setForm((previous) => ({
      ...previous,
      region: regionId,
      departement: "",
      commune: "",
    }));

    setDepartments([]);
    setCommunes([]);

    setCommuneSearch("");
    setShowSuggestions(false);
    setError("");
  }

  // =========================================================
  // Changement de département
  // =========================================================
  function handleDepartmentChange(event) {
    const departmentId = event.target.value;

    setForm((previous) => ({
      ...previous,
      departement: departmentId,
      commune: "",
    }));

    setCommunes([]);
    setCommuneSearch("");
    setShowSuggestions(false);
    setError("");
  }

  // =========================================================
  // Recherche de commune/localité
  // =========================================================
  const filteredCommunes = communes.filter((commune) =>
    normalizeText(commune.nom).includes(
      normalizeText(communeSearch)
    )
  );

  // =========================================================
  // Sélection d'une commune/localité
  // =========================================================
  function handleSelectCommune(commune) {
    setForm((previous) => ({
      ...previous,
      commune: String(commune.id),
    }));

    setCommuneSearch(commune.nom);
    setShowSuggestions(false);
    setError("");
  }

  // =========================================================
  // Soumission
  // =========================================================
  async function submit(event) {
    event.preventDefault();
    setError("");

    if (!form.commune) {
      setError(
        "Veuillez sélectionner une commune ou une localité dans les suggestions."
      );
      return;
    }

    if (!form.culture) {
      setError("Veuillez sélectionner une culture.");
      return;
    }

    setLoading(true);

    try {
      await cultureService.createCulture({
        region: Number(form.region),
        departement: Number(form.departement),
        commune: Number(form.commune),
        culture: Number(form.culture),
        superficie: form.superficie,
        date_semis: form.date_semis,
        type_sol: form.type_sol,
      });

      navigate("/dashboard");
    } catch (err) {
      setError(
        err.message ||
          "Impossible de créer la culture."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-[72vh] bg-sand px-3 py-8 sm:px-5 lg:py-[70px]">
      <div className="mx-auto grid max-w-7xl overflow-hidden rounded-[10px] border border-earth bg-white shadow-[0_12px_35px_rgba(31,31,27,0.06)] lg:grid-cols-2">

        {/* ================================================= */}
        {/* GAUCHE : FORMULAIRE */}
        {/* ================================================= */}
        <section className="flex items-center justify-center p-6 sm:p-8 lg:p-12">
          <div className="w-full max-w-[560px]">

            <span className="text-xs font-extrabold uppercase tracking-[0.11em] text-primary">
              Nouvelle culture
            </span>

            <h1 className="mt-2 font-display text-[36px] font-medium leading-tight tracking-[-0.045em] text-ink sm:text-[44px]">
              Créer votre suivi agricole
            </h1>

            <p className="mt-2 text-muted">
              Renseignez les informations de votre culture.
            </p>

            <div className="mt-5">
              <ErrorMessage message={error} />
            </div>

            <form
              className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2"
              onSubmit={submit}
            >

              {/* ================================================= */}
              {/* RÉGION */}
              {/* ================================================= */}
              <div>
                <label
                  htmlFor="region"
                  className="mb-1.5 block text-sm font-bold text-ink"
                >
                  Région
                </label>

                <select
                  id="region"
                  value={form.region}
                  onChange={handleRegionChange}
                  required
                  className="w-full rounded-md border border-earth bg-white px-4 py-3 outline-none focus:border-primary"
                >
                  <option value="">Région</option>

                  {regions.map((region) => (
                    <option key={region.id} value={region.id}>
                      {region.nom}
                    </option>
                  ))}
                </select>
              </div>

              {/* ================================================= */}
              {/* DÉPARTEMENT */}
              {/* ================================================= */}
              <div>
                <label
                  htmlFor="departement"
                  className="mb-1.5 block text-sm font-bold text-ink"
                >
                  Département
                </label>

                <select
                  id="departement"
                  value={form.departement}
                  onChange={handleDepartmentChange}
                  disabled={!form.region}
                  required
                  className="w-full rounded-md border border-earth bg-white px-4 py-3 outline-none focus:border-primary disabled:bg-sand"
                >
                  <option value="">
                    {form.region
                      ? "Département"
                      : "Choisissez d'abord une région"}
                  </option>

                  {departments.map((department) => (
                    <option
                      key={department.id}
                      value={department.id}
                    >
                      {department.nom}
                    </option>
                  ))}
                </select>
              </div>

              {/* ================================================= */}
              {/* COMMUNE / LOCALITÉ - RECHERCHE */}
              {/* ================================================= */}
              <div className="relative sm:col-span-2">
                <label
                  htmlFor="commune-search"
                  className="mb-1.5 block text-sm font-bold text-ink"
                >
                  Commune / Localité
                </label>

                <input
                  id="commune-search"
                  type="text"
                  value={communeSearch}
                  onChange={(event) => {
                    setCommuneSearch(event.target.value);
                    setForm((previous) => ({
                      ...previous,
                      commune: "",
                    }));
                    setShowSuggestions(true);
                  }}
                  onFocus={() => {
                    if (form.departement) {
                      setShowSuggestions(true);
                    }
                  }}
                  placeholder={
                    form.departement
                      ? "Rechercher une commune ou localité..."
                      : "Choisissez d'abord un département"
                  }
                  disabled={!form.departement}
                  required
                  autoComplete="off"
                  className="w-full rounded-md border border-earth bg-white px-4 py-3 outline-none focus:border-primary disabled:bg-sand"
                />

                {/* SUGGESTIONS */}
                {showSuggestions &&
                  form.departement &&
                  communeSearch.trim() !== "" && (
                    <div className="absolute z-20 mt-1 max-h-60 w-full overflow-y-auto rounded-md border border-earth bg-white shadow-lg">
                      {filteredCommunes.length > 0 ? (
                        filteredCommunes.map((commune) => (
                          <button
                            key={commune.id}
                            type="button"
                            onMouseDown={(event) => {
                              event.preventDefault();
                            }}
                            onClick={() =>
                              handleSelectCommune(commune)
                            }
                            className="block w-full border-b border-earth/50 px-4 py-3 text-left text-sm text-ink last:border-b-0 hover:bg-sand"
                          >
                            {commune.nom}
                          </button>
                        ))
                      ) : (
                        <div className="px-4 py-3 text-sm text-muted">
                          Aucune commune ou localité trouvée.
                        </div>
                      )}
                    </div>
                  )}

                {/* LOCALITÉ SÉLECTIONNÉE */}
                {form.commune && (
                  <p className="mt-2 text-xs font-semibold text-primary">
                    Localité sélectionnée : {communeSearch}
                  </p>
                )}
              </div>

              {/* ================================================= */}
              {/* CULTURE */}
              {/* ================================================= */}
              <div>
                <label
                  htmlFor="culture"
                  className="mb-1.5 block text-sm font-bold text-ink"
                >
                  Culture
                </label>

                <select
                  id="culture"
                  value={form.culture}
                  onChange={(event) =>
                    setForm({
                      ...form,
                      culture: event.target.value,
                    })
                  }
                  required
                  className="w-full rounded-md border border-earth bg-white px-4 py-3 outline-none focus:border-primary"
                >
                  <option value="">Culture</option>

                  {cultures.map((culture) => (
                    <option key={culture.id} value={culture.id}>
                      {culture.nom}
                    </option>
                  ))}
                </select>
              </div>

              {/* ================================================= */}
              {/* SUPERFICIE */}
              {/* ================================================= */}
              <div>
                <label
                  htmlFor="superficie"
                  className="mb-1.5 block text-sm font-bold text-ink"
                >
                  Superficie (ha)
                </label>

                <input
                  id="superficie"
                  type="number"
                  min="0.01"
                  step="0.01"
                  placeholder="Exemple : 2.5"
                  value={form.superficie}
                  onChange={(event) =>
                    setForm({
                      ...form,
                      superficie: event.target.value,
                    })
                  }
                  required
                  className="w-full rounded-md border border-earth bg-white px-4 py-3 outline-none focus:border-primary"
                />
              </div>

              {/* ================================================= */}
              {/* DATE DE SEMIS */}
              {/* ================================================= */}
              <div>
                <label
                  htmlFor="date_semis"
                  className="mb-1.5 block text-sm font-bold text-ink"
                >
                  Date de semis
                </label>

                <input
                  id="date_semis"
                  type="date"
                  value={form.date_semis}
                  onChange={(event) =>
                    setForm({
                      ...form,
                      date_semis: event.target.value,
                    })
                  }
                  required
                  className="w-full rounded-md border border-earth bg-white px-4 py-3 outline-none focus:border-primary"
                />
              </div>

              {/* ================================================= */}
              {/* TYPE DE SOL */}
              {/* ================================================= */}
              <div>
                <label
                  htmlFor="type_sol"
                  className="mb-1.5 block text-sm font-bold text-ink"
                >
                  Type de sol
                </label>

                <select
                  id="type_sol"
                  value={form.type_sol}
                  onChange={(event) =>
                    setForm({
                      ...form,
                      type_sol: event.target.value,
                    })
                  }
                  required
                  className="w-full rounded-md border border-earth bg-white px-4 py-3 outline-none focus:border-primary"
                >
                  <option value="sableux">Sol sableux</option>
                  <option value="argileux">Sol argileux</option>
                  <option value="limoneux">Sol limoneux</option>
                  <option value="sablo-limoneux">
                    Sol sablo-limoneux
                  </option>
                </select>
              </div>

              {/* ================================================= */}
              {/* BOUTON */}
              {/* ================================================= */}
              <button
                type="submit"
                disabled={loading}
                className="inline-flex items-center justify-center rounded-md border border-primary bg-primary px-5 py-3 font-bold text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60 sm:col-span-2"
              >
                {loading
                  ? "Création en cours..."
                  : "Créer la culture"}
              </button>
            </form>
          </div>
        </section>

        {/* ================================================= */}
        {/* DROITE : GRANDE IMAGE */}
        {/* ================================================= */}
        <section className="relative min-h-[500px] lg:min-h-[700px]">
          <img
            src="/images/culture-agricole.jpg"
            alt="Culture agricole"
            className="absolute inset-0 h-full w-full object-cover"
          />
        </section>
      </div>
    </main>
  );
}