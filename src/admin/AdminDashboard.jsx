// VERSION 2.0.0
// import { useMemo, useState } from "react";
// import {
//   CalendarDays,
//   ChevronLeft,
//   ChevronRight,
//   ClipboardList,
//   LayoutDashboard,
//   Leaf,
//   Menu,
//   Pencil,
//   Plus,
//   Search,
//   Settings,
//   Sprout,
//   Trash2,
//   UserRound,
//   Users,
//   X,
// } from "lucide-react";

// import { useAuth } from "../contexts/AuthContext";

// const OFFICIAL_CROPS = [
//   "Riz",
//   "Mil",
//   "Maïs",
//   "Sorgho",
//   "Arachide",
//   "Niébé",
//   "Manioc",
//   "Oignon",
//   "Mangue",
//   "Pastèque",
// ];

// /*
//  * Données d'affichage temporaires.
//  *
//  * Elles seront remplacées par les données renvoyées par
//  * l'API d'administration lorsque les endpoints CRUD admin
//  * seront branchés.
//  */

// // Ancien code statique des agriculteurs, remplacé par des appels API pour récupérer les données réelles.

// const INITIAL_FARMERS = [
//   {
//     id: 1,
//     first_name: "Mamadou",
//     last_name: "Diallo",
//     username: "mamadou",
//     telephone: "77 000 00 00",
//     email: "mamadou@example.com",
//     cultures: 2,
//     status: "Actif",
//     location: "Thiès",
//   },
//   {
//     id: 2,
//     first_name: "Awa",
//     last_name: "Diop",
//     username: "awa",
//     telephone: "76 000 00 00",
//     email: "awa@example.com",
//     cultures: 1,
//     status: "Actif",
//     location: "Kaolack",
//   },
//   {
//     id: 3,
//     first_name: "Ibrahima",
//     last_name: "Ndiaye",
//     username: "ibrahima",
//     telephone: "78 000 00 00",
//     email: "ibrahima@example.com",
//     cultures: 3,
//     status: "Actif",
//     location: "Kédougou",
//   },
// ];

// const MENU = [
//   {
//     id: "overview",
//     label: "Tableau de bord",
//     icon: LayoutDashboard,
//   },
//   {
//     id: "farmers",
//     label: "Agriculteurs",
//     icon: Users,
//   },
//   {
//     id: "cultures",
//     label: "Cultures",
//     icon: Sprout,
//   },
//   {
//     id: "calendar",
//     label: "Calendriers",
//     icon: CalendarDays,
//   },
//   {
//     id: "data",
//     label: "Données agricoles",
//     icon: ClipboardList,
//   },
//   {
//     id: "profile",
//     label: "Mon profil",
//     icon: UserRound,
//   },
// ];




// export default function AdminDashboard() {
//   const { user, logout } = useAuth();

//   const [activeMenu, setActiveMenu] =
//     useState("overview");

//   const [mobileMenuOpen, setMobileMenuOpen] =
//     useState(false);

//   const [farmers, setFarmers] =
//     useState(INITIAL_FARMERS);

//   const [search, setSearch] = useState("");

//   const [selectedFarmer, setSelectedFarmer] =
//     useState(null);

//   const [modal, setModal] = useState(null);

//   const [farmerForm, setFarmerForm] = useState({
//     first_name: "",
//     last_name: "",
//     username: "",
//     telephone: "",
//     email: "",
//   });

//   const [cultureForm, setCultureForm] = useState({
//     farmer: "",
//     culture: "",
//     superficie: "",
//     date_semis: "",
//     type_sol: "sableux",
//   });

//   const filteredFarmers = useMemo(() => {
//     const query = search.toLowerCase().trim();

//     if (!query) {
//       return farmers;
//     }

//     return farmers.filter((farmer) =>
//       [
//         farmer.first_name,
//         farmer.last_name,
//         farmer.username,
//         farmer.telephone,
//         farmer.email,
//         farmer.location,
//       ]
//         .join(" ")
//         .toLowerCase()
//         .includes(query)
//     );
//   }, [farmers, search]);

//   function closeModal() {
//     setModal(null);
//     setSelectedFarmer(null);
//   }

//   function openAddFarmer() {
//     setFarmerForm({
//       first_name: "",
//       last_name: "",
//       username: "",
//       telephone: "",
//       email: "",
//     });

//     setModal("farmer");
//   }

//   function openEditFarmer(farmer) {
//     setSelectedFarmer(farmer);

//     setFarmerForm({
//       first_name: farmer.first_name,
//       last_name: farmer.last_name,
//       username: farmer.username,
//       telephone: farmer.telephone,
//       email: farmer.email,
//     });

//     setModal("farmer");
//   }

//   function saveFarmer(event) {
//     event.preventDefault();

//     if (selectedFarmer) {
//       setFarmers((current) =>
//         current.map((farmer) =>
//           farmer.id === selectedFarmer.id
//             ? {
//                 ...farmer,
//                 ...farmerForm,
//               }
//             : farmer
//         )
//       );
//     } else {
//       setFarmers((current) => [
//         ...current,
//         {
//           id: Date.now(),
//           ...farmerForm,
//           cultures: 0,
//           status: "Actif",
//           location: "Non renseignée",
//         },
//       ]);
//     }

//     closeModal();
//   }

//   function deleteFarmer(farmer) {
//     const confirmed = window.confirm(
//       `Supprimer l'agriculteur ${farmer.first_name} ${farmer.last_name} ?`
//     );

//     if (!confirmed) {
//       return;
//     }

//     setFarmers((current) =>
//       current.filter(
//         (item) => item.id !== farmer.id
//       )
//     );
//   }

//   function openAddCulture(farmer = null) {
//     setCultureForm({
//       farmer: farmer ? String(farmer.id) : "",
//       culture: "",
//       superficie: "",
//       date_semis: "",
//       type_sol: "sableux",
//     });

//     setModal("culture");
//   }

//   function saveCulture(event) {
//     event.preventDefault();

//     if (!cultureForm.farmer || !cultureForm.culture) {
//       return;
//     }

//     setFarmers((current) =>
//       current.map((farmer) =>
//         String(farmer.id) === cultureForm.farmer
//           ? {
//               ...farmer,
//               cultures: farmer.cultures + 1,
//             }
//           : farmer
//       )
//     );

//     closeModal();
//   }

//   async function handleLogout() {
//     await logout();
//   }

//   return (
//     <div className="min-h-screen bg-sand">

//       {/* MOBILE HEADER */}
//       <header className="sticky top-0 z-40 flex items-center justify-between border-b border-earth bg-white px-4 py-4 lg:hidden">
//         <div>
//           <p className="font-display text-xl font-bold">
//             Agri-Conseil
//           </p>
//           <span className="text-xs font-semibold text-muted">
//             Administration
//           </span>
//         </div>

//         <button
//           type="button"
//           onClick={() =>
//             setMobileMenuOpen(true)
//           }
//           className="rounded-xl border border-earth p-2"
//         >
//           <Menu size={22} />
//         </button>
//       </header>

//       {/* MOBILE DRAWER */}
//       {mobileMenuOpen && (
//         <div className="fixed inset-0 z-50 lg:hidden">
//           <div
//             className="absolute inset-0 bg-black/40"
//             onClick={() =>
//               setMobileMenuOpen(false)
//             }
//           />

//           <aside className="relative h-full w-[290px] bg-white p-5 shadow-2xl">
//             <div className="flex items-center justify-between">
//               <div>
//                 <p className="font-display text-xl font-bold">
//                   Agri-Conseil
//                 </p>
//                 <span className="text-xs font-semibold text-muted">
//                   Administration
//                 </span>
//               </div>

//               <button
//                 type="button"
//                 onClick={() =>
//                   setMobileMenuOpen(false)
//                 }
//                 className="rounded-xl border border-earth p-2"
//               >
//                 <X size={20} />
//               </button>
//             </div>

//             <AdminMenu
//               activeMenu={activeMenu}
//               onChange={(id) => {
//                 setActiveMenu(id);
//                 setMobileMenuOpen(false);
//               }}
//             />

//             <button
//               type="button"
//               onClick={handleLogout}
//               className="mt-5 w-full rounded-xl bg-sand px-4 py-3 text-left font-semibold text-ink"
//             >
//               Se déconnecter
//             </button>
//           </aside>
//         </div>
//       )}

//       <div className="flex min-h-screen">

//         {/* SIDEBAR DESKTOP */}
//         <aside className="sticky top-0 hidden h-screen w-[270px] shrink-0 border-r border-earth bg-white p-5 lg:flex lg:flex-col">
//           <div className="px-3">
//             <div className="flex items-center gap-3">
//               <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary text-white">
//                 <Leaf size={21} />
//               </div>

//               <div>
//                 <p className="font-display text-xl font-bold">
//                   Agri-Conseil
//                 </p>
//                 <span className="text-xs font-semibold text-muted">
//                   Administration
//                 </span>
//               </div>
//             </div>
//           </div>

//           <AdminMenu
//             activeMenu={activeMenu}
//             onChange={setActiveMenu}
//           />

//           <div className="mt-auto">
//             <div className="mb-4 rounded-2xl bg-soft p-4">
//               <p className="text-xs font-bold uppercase tracking-[0.1em] text-primary">
//                 Administrateur
//               </p>

//               <p className="mt-2 font-semibold">
//                 {user?.first_name ||
//                   user?.username ||
//                   "Administrateur"}
//               </p>
//             </div>

//             <button
//               type="button"
//               onClick={handleLogout}
//               className="w-full rounded-xl border border-earth px-4 py-3 text-left font-semibold transition hover:border-primary hover:text-primary"
//             >
//               Se déconnecter
//             </button>
//           </div>
//         </aside>

//         {/* CONTENU */}
//         <main className="min-w-0 flex-1 px-4 py-6 sm:px-6 lg:px-10 lg:py-10">

//           {/* HEADER CONTENU */}
//           <header className="mb-8">
//             <p className="text-xs font-extrabold uppercase tracking-[0.12em] text-primary">
//               Administration
//             </p>

//             <div className="mt-2 flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
//               <div>
//                 <h1 className="font-display text-4xl tracking-[-0.04em]">
//                   {activeMenu === "overview" &&
//                     "Tableau de bord"}

//                   {activeMenu === "farmers" &&
//                     "Gestion des agriculteurs"}

//                   {activeMenu === "cultures" &&
//                     "Gestion des cultures"}

//                   {activeMenu === "calendar" &&
//                     "Calendriers agricoles"}

//                   {activeMenu === "data" &&
//                     "Données agricoles"}

//                   {activeMenu === "profile" &&
//                     "Mon profil"}
//                 </h1>

//                 <p className="mt-2 max-w-2xl text-muted">
//                   Gérez les utilisateurs et les données de la
//                   plateforme Agri-Conseil.
//                 </p>
//               </div>
//             </div>
//           </header>

//           {/* TABLEAU DE BORD */}
//           {activeMenu === "overview" && (
//             <section className="space-y-6">
//               <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
//                 <AdminStat
//                   icon={Users}
//                   label="Agriculteurs"
//                   value={farmers.length}
//                 />

//                 <AdminStat
//                   icon={Sprout}
//                   label="Cultures suivies"
//                   value={farmers.reduce(
//                     (total, farmer) =>
//                       total + farmer.cultures,
//                     0
//                   )}
//                 />

//                 <AdminStat
//                   icon={Leaf}
//                   label="Cultures officielles"
//                   value={10}
//                 />

//                 <AdminStat
//                   icon={CalendarDays}
//                   label="Modules"
//                   value={6}
//                 />
//               </div>

//               <div className="grid gap-5 xl:grid-cols-2">
//                 <article className="rounded-[24px] border border-earth bg-white p-6 shadow-sm">
//                   <div className="flex items-center justify-between">
//                     <div>
//                       <span className="text-xs font-extrabold uppercase tracking-[0.1em] text-primary">
//                         Activité
//                       </span>
//                       <h2 className="mt-1 text-2xl font-bold">
//                         Agriculteurs
//                       </h2>
//                     </div>

//                     <Users
//                       size={22}
//                       className="text-primary"
//                     />
//                   </div>

//                   <div className="mt-6 space-y-3">
//                     {farmers.slice(0, 5).map((farmer) => (
//                       <div
//                         key={farmer.id}
//                         className="flex items-center justify-between rounded-xl bg-sand p-4"
//                       >
//                         <div>
//                           <p className="font-semibold">
//                             {farmer.first_name}{" "}
//                             {farmer.last_name}
//                           </p>

//                           <p className="text-sm text-muted">
//                             {farmer.location}
//                           </p>
//                         </div>

//                         <span className="rounded-full bg-soft px-3 py-1 text-xs font-bold text-primary">
//                           {farmer.cultures} culture
//                           {farmer.cultures > 1
//                             ? "s"
//                             : ""}
//                         </span>
//                       </div>
//                     ))}
//                   </div>
//                 </article>

//                 <article className="rounded-[24px] border border-primary/20 bg-primary p-6 text-white">
//                   <span className="text-xs font-extrabold uppercase tracking-[0.1em] text-white/70">
//                     Référentiel
//                   </span>

//                   <h2 className="mt-1 font-display text-3xl">
//                     Les 10 cultures officielles
//                   </h2>

//                   <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3">
//                     {OFFICIAL_CROPS.map((crop) => (
//                       <div
//                         key={crop}
//                         className="rounded-xl bg-white/10 px-3 py-3 text-sm font-semibold"
//                       >
//                         {crop}
//                       </div>
//                     ))}
//                   </div>

//                   <p className="mt-6 text-sm leading-6 text-white/75">
//                     Ce référentiel reste limité aux 10 cultures
//                     définies pour Agri-Conseil.
//                   </p>
//                 </article>
//               </div>
//             </section>
//           )}

//           {/* AGRICULTEURS */}
//           {activeMenu === "farmers" && (
//             <section className="space-y-5">
//               <div className="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
//                 <div className="relative w-full xl:max-w-md">
//                   <Search
//                     size={19}
//                     className="absolute left-4 top-1/2 -translate-y-1/2 text-muted"
//                   />

//                   <input
//                     value={search}
//                     onChange={(e) =>
//                       setSearch(e.target.value)
//                     }
//                     placeholder="Rechercher un agriculteur..."
//                     className="w-full rounded-xl border border-earth bg-white py-3 pl-11 pr-4 outline-none focus:border-primary"
//                   />
//                 </div>

//                 <button
//                   type="button"
//                   onClick={openAddFarmer}
//                   className="inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-5 py-3 font-semibold text-white"
//                 >
//                   <Plus size={18} />
//                   Ajouter un agriculteur
//                 </button>
//               </div>

//               {/* TABLE DESKTOP */}
//               <div className="hidden overflow-hidden rounded-[24px] border border-earth bg-white shadow-sm lg:block">
//                 <div className="overflow-x-auto">
//                   <table className="w-full border-collapse">
//                     <thead className="bg-sand">
//                       <tr className="text-left text-xs font-extrabold uppercase tracking-[0.08em] text-muted">
//                         <th className="px-6 py-4">
//                           Agriculteur
//                         </th>
//                         <th className="px-6 py-4">
//                           Contact
//                         </th>
//                         <th className="px-6 py-4">
//                           Localisation
//                         </th>
//                         <th className="px-6 py-4">
//                           Cultures
//                         </th>
//                         <th className="px-6 py-4 text-right">
//                           Actions
//                         </th>
//                       </tr>
//                     </thead>

//                     <tbody>
//                       {filteredFarmers.map((farmer) => (
//                         <tr
//                           key={farmer.id}
//                           className="border-t border-earth/70"
//                         >
//                           <td className="px-6 py-5">
//                             <p className="font-bold">
//                               {farmer.first_name}{" "}
//                               {farmer.last_name}
//                             </p>
//                             <p className="text-sm text-muted">
//                               @{farmer.username}
//                             </p>
//                           </td>

//                           <td className="px-6 py-5 text-sm">
//                             <p>{farmer.telephone}</p>
//                             <p className="text-muted">
//                               {farmer.email}
//                             </p>
//                           </td>

//                           <td className="px-6 py-5 text-sm">
//                             {farmer.location}
//                           </td>

//                           <td className="px-6 py-5">
//                             <span className="rounded-full bg-soft px-3 py-1 text-xs font-bold text-primary">
//                               {farmer.cultures}
//                             </span>
//                           </td>

//                           <td className="px-6 py-5">
//                             <div className="flex justify-end gap-2">
//                               <button
//                                 type="button"
//                                 onClick={() =>
//                                   openAddCulture(farmer)
//                                 }
//                                 title="Ajouter une culture"
//                                 className="rounded-lg border border-earth p-2 text-primary hover:border-primary"
//                               >
//                                 <Plus size={17} />
//                               </button>

//                               <button
//                                 type="button"
//                                 onClick={() =>
//                                   openEditFarmer(farmer)
//                                 }
//                                 title="Modifier"
//                                 className="rounded-lg border border-earth p-2 hover:border-primary hover:text-primary"
//                               >
//                                 <Pencil size={17} />
//                               </button>

//                               <button
//                                 type="button"
//                                 onClick={() =>
//                                   deleteFarmer(farmer)
//                                 }
//                                 title="Supprimer"
//                                 className="rounded-lg border border-earth p-2 text-red-600 hover:border-red-300"
//                               >
//                                 <Trash2 size={17} />
//                               </button>
//                             </div>
//                           </td>
//                         </tr>
//                       ))}
//                     </tbody>
//                   </table>
//                 </div>
//               </div>

//               {/* MOBILE */}
//               <div className="space-y-3 lg:hidden">
//                 {filteredFarmers.map((farmer) => (
//                   <article
//                     key={farmer.id}
//                     className="rounded-2xl border border-earth bg-white p-5 shadow-sm"
//                   >
//                     <div className="flex items-start justify-between gap-4">
//                       <div>
//                         <h3 className="text-lg font-bold">
//                           {farmer.first_name}{" "}
//                           {farmer.last_name}
//                         </h3>

//                         <p className="text-sm text-muted">
//                           @{farmer.username}
//                         </p>
//                       </div>

//                       <span className="rounded-full bg-soft px-3 py-1 text-xs font-bold text-primary">
//                         {farmer.cultures} culture
//                       </span>
//                     </div>

//                     <div className="mt-4 space-y-2 text-sm text-muted">
//                       <p>{farmer.telephone}</p>
//                       <p>{farmer.email}</p>
//                       <p>{farmer.location}</p>
//                     </div>

//                     <div className="mt-4 flex gap-2">
//                       <button
//                         type="button"
//                         onClick={() =>
//                           openAddCulture(farmer)
//                         }
//                         className="flex-1 rounded-xl border border-earth py-2.5 text-sm font-semibold text-primary"
//                       >
//                         Ajouter culture
//                       </button>

//                       <button
//                         type="button"
//                         onClick={() =>
//                           openEditFarmer(farmer)
//                         }
//                         className="rounded-xl border border-earth p-2.5"
//                       >
//                         <Pencil size={17} />
//                       </button>

//                       <button
//                         type="button"
//                         onClick={() =>
//                           deleteFarmer(farmer)
//                         }
//                         className="rounded-xl border border-earth p-2.5 text-red-600"
//                       >
//                         <Trash2 size={17} />
//                       </button>
//                     </div>
//                   </article>
//                 ))}
//               </div>
//             </section>
//           )}

//           {/* CULTURES */}
//           {activeMenu === "cultures" && (
//             <section className="rounded-[24px] border border-earth bg-white p-6 shadow-sm">
//               <div className="flex items-center justify-between">
//                 <div>
//                   <span className="text-xs font-extrabold uppercase tracking-[0.1em] text-primary">
//                     Référentiel
//                   </span>

//                   <h2 className="mt-1 font-display text-3xl">
//                     Les 10 cultures d'Agri-Conseil
//                   </h2>
//                 </div>

//                 <Leaf
//                   size={24}
//                   className="text-primary"
//                 />
//               </div>

//               <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
//                 {OFFICIAL_CROPS.map((crop, index) => (
//                   <article
//                     key={crop}
//                     className="rounded-2xl border border-earth p-5"
//                   >
//                     <span className="text-xs font-bold text-primary">
//                       {String(index + 1).padStart(2, "0")}
//                     </span>

//                     <h3 className="mt-2 text-lg font-bold">
//                       {crop}
//                     </h3>

//                     <p className="mt-2 text-sm leading-6 text-muted">
//                       Culture référencée dans Agri-Conseil.
//                     </p>
//                   </article>
//                 ))}
//               </div>
//             </section>
//           )}

//           {/* CALENDRIERS */}
//           {activeMenu === "calendar" && (
//             <section className="rounded-[24px] border border-earth bg-white p-6 shadow-sm">
//               <span className="text-xs font-extrabold uppercase tracking-[0.1em] text-primary">
//                 Administration
//               </span>

//               <h2 className="mt-1 font-display text-3xl">
//                 Gestion des calendriers
//               </h2>

//               <p className="mt-3 max-w-2xl leading-7 text-muted">
//                 Cette section servira à consulter et administrer
//                 les règles utilisées pour générer automatiquement
//                 les calendriers agricoles.
//               </p>

//               <div className="mt-7 rounded-2xl bg-sand p-5">
//                 <p className="font-semibold">
//                   Règles du calendrier
//                 </p>

//                 <p className="mt-2 text-sm leading-6 text-muted">
//                   Les durées et opérations dépendent de chaque
//                   culture et de son cycle.
//                 </p>
//               </div>
//             </section>
//           )}

//           {/* DONNEES */}
//           {activeMenu === "data" && (
//             <section className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
//               {[
//                 [
//                   "Référentiel géographique",
//                   "Régions, départements et communes/localités.",
//                 ],
//                 [
//                   "Données météorologiques",
//                   "Paramètres nécessaires aux services météo.",
//                 ],
//                 [
//                   "Données agronomiques",
//                   "Cycles, besoins en eau, stades et règles.",
//                 ],
//               ].map(([title, description]) => (
//                 <article
//                   key={title}
//                   className="rounded-[24px] border border-earth bg-white p-6 shadow-sm"
//                 >
//                   <Settings
//                     size={23}
//                     className="text-primary"
//                   />

//                   <h2 className="mt-5 text-xl font-bold">
//                     {title}
//                   </h2>

//                   <p className="mt-2 leading-6 text-muted">
//                     {description}
//                   </p>
//                 </article>
//               ))}
//             </section>
//           )}

//           {/* PROFIL ADMIN */}
//           {activeMenu === "profile" && (
//             <section className="rounded-[24px] border border-earth bg-white p-6 shadow-sm sm:p-8">
//               <div className="flex items-center gap-4">
//                 <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary text-white">
//                   <UserRound size={28} />
//                 </div>

//                 <div>
//                   <span className="text-xs font-extrabold uppercase tracking-[0.1em] text-primary">
//                     Administrateur
//                   </span>

//                   <h2 className="mt-1 font-display text-3xl">
//                     Mon profil
//                   </h2>
//                 </div>
//               </div>

//               <div className="mt-8 grid gap-4 sm:grid-cols-2">
//                 <div className="rounded-xl bg-sand p-4">
//                   <span className="text-sm text-muted">
//                     Nom d'utilisateur
//                   </span>

//                   <p className="mt-1 font-bold">
//                     {user?.username || "—"}
//                   </p>
//                 </div>

//                 <div className="rounded-xl bg-sand p-4">
//                   <span className="text-sm text-muted">
//                     Email
//                   </span>

//                   <p className="mt-1 font-bold">
//                     {user?.email || "—"}
//                   </p>
//                 </div>
//               </div>
//             </section>
//           )}
//         </main>
//       </div>

//       {/* MODAL AGRICULTEUR */}
//       {modal === "farmer" && (
//         <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/45 px-4 py-6">
//           <div className="w-full max-w-2xl rounded-[24px] bg-white p-6 shadow-2xl sm:p-8">
//             <div className="flex items-center justify-between">
//               <div>
//                 <span className="text-xs font-extrabold uppercase tracking-[0.1em] text-primary">
//                   Gestion agriculteur
//                 </span>

//                 <h2 className="mt-1 font-display text-3xl">
//                   {selectedFarmer
//                     ? "Modifier l'agriculteur"
//                     : "Ajouter un agriculteur"}
//                 </h2>
//               </div>

//               <button
//                 type="button"
//                 onClick={closeModal}
//                 className="rounded-xl border border-earth p-2"
//               >
//                 <X size={20} />
//               </button>
//             </div>

//             <form
//               onSubmit={saveFarmer}
//               className="mt-7 grid gap-4 sm:grid-cols-2"
//             >
//               {[
//                 ["first_name", "Prénom"],
//                 ["last_name", "Nom"],
//                 ["username", "Nom d'utilisateur"],
//                 ["telephone", "Téléphone"],
//                 ["email", "Email"],
//               ].map(([key, placeholder]) => (
//                 <input
//                   key={key}
//                   type={
//                     key === "email"
//                       ? "email"
//                       : "text"
//                   }
//                   value={farmerForm[key]}
//                   onChange={(e) =>
//                     setFarmerForm({
//                       ...farmerForm,
//                       [key]: e.target.value,
//                     })
//                   }
//                   placeholder={placeholder}
//                   className={`rounded-xl border border-earth px-4 py-3 outline-none focus:border-primary ${
//                     key === "email"
//                       ? "sm:col-span-2"
//                       : ""
//                   }`}
//                   required
//                 />
//               ))}

//               <div className="flex gap-3 sm:col-span-2">
//                 <button
//                   type="submit"
//                   className="flex-1 rounded-xl bg-primary px-5 py-3 font-semibold text-white"
//                 >
//                   Enregistrer
//                 </button>

//                 <button
//                   type="button"
//                   onClick={closeModal}
//                   className="rounded-xl border border-earth px-5 py-3 font-semibold"
//                 >
//                   Annuler
//                 </button>
//               </div>
//             </form>
//           </div>
//         </div>
//       )}

//       {/* MODAL CULTURE */}
//       {modal === "culture" && (
//         <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/45 px-4 py-6">
//           <div className="w-full max-w-2xl rounded-[24px] bg-white p-6 shadow-2xl sm:p-8">
//             <div className="flex items-center justify-between">
//               <div>
//                 <span className="text-xs font-extrabold uppercase tracking-[0.1em] text-primary">
//                   Nouvelle culture
//                 </span>

//                 <h2 className="mt-1 font-display text-3xl">
//                   Ajouter une culture
//                 </h2>
//               </div>

//               <button
//                 type="button"
//                 onClick={closeModal}
//                 className="rounded-xl border border-earth p-2"
//               >
//                 <X size={20} />
//               </button>
//             </div>

//             <form
//               onSubmit={saveCulture}
//               className="mt-7 grid gap-4 sm:grid-cols-2"
//             >
//               <select
//                 value={cultureForm.farmer}
//                 onChange={(e) =>
//                   setCultureForm({
//                     ...cultureForm,
//                     farmer: e.target.value,
//                   })
//                 }
//                 className="rounded-xl border border-earth bg-white px-4 py-3 outline-none focus:border-primary sm:col-span-2"
//                 required
//               >
//                 <option value="">
//                   Choisir l'agriculteur
//                 </option>

//                 {farmers.map((farmer) => (
//                   <option
//                     key={farmer.id}
//                     value={farmer.id}
//                   >
//                     {farmer.first_name}{" "}
//                     {farmer.last_name}
//                   </option>
//                 ))}
//               </select>

//               <select
//                 value={cultureForm.culture}
//                 onChange={(e) =>
//                   setCultureForm({
//                     ...cultureForm,
//                     culture: e.target.value,
//                   })
//                 }
//                 className="rounded-xl border border-earth bg-white px-4 py-3 outline-none focus:border-primary"
//                 required
//               >
//                 <option value="">
//                   Culture
//                 </option>

//                 {OFFICIAL_CROPS.map((crop) => (
//                   <option key={crop} value={crop}>
//                     {crop}
//                   </option>
//                 ))}
//               </select>

//               <input
//                 type="number"
//                 min="0.01"
//                 step="0.01"
//                 value={cultureForm.superficie}
//                 onChange={(e) =>
//                   setCultureForm({
//                     ...cultureForm,
//                     superficie: e.target.value,
//                   })
//                 }
//                 placeholder="Superficie (ha)"
//                 className="rounded-xl border border-earth px-4 py-3 outline-none focus:border-primary"
//                 required
//               />

//               <input
//                 type="date"
//                 value={cultureForm.date_semis}
//                 onChange={(e) =>
//                   setCultureForm({
//                     ...cultureForm,
//                     date_semis: e.target.value,
//                   })
//                 }
//                 className="rounded-xl border border-earth px-4 py-3 outline-none focus:border-primary"
//                 required
//               />

//               <select
//                 value={cultureForm.type_sol}
//                 onChange={(e) =>
//                   setCultureForm({
//                     ...cultureForm,
//                     type_sol: e.target.value,
//                   })
//                 }
//                 className="rounded-xl border border-earth bg-white px-4 py-3 outline-none focus:border-primary"
//               >
//                 <option value="sableux">
//                   Sol sableux
//                 </option>
//                 <option value="argileux">
//                   Sol argileux
//                 </option>
//                 <option value="limoneux">
//                   Sol limoneux
//                 </option>
//                 <option value="sablo-limoneux">
//                   Sol sablo-limoneux
//                 </option>
//               </select>

//               <button
//                 type="submit"
//                 className="rounded-xl bg-primary px-5 py-3 font-semibold text-white sm:col-span-2"
//               >
//                 Ajouter la culture
//               </button>
//             </form>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// }

// function AdminMenu({ activeMenu, onChange }) {
//   return (
//     <nav className="mt-8 space-y-2">
//       {MENU.map(({ id, label, icon: Icon }) => (
//         <button
//           key={id}
//           type="button"
//           onClick={() => onChange(id)}
//           className={`flex w-full items-center gap-3 rounded-xl px-4 py-3 text-left text-sm font-semibold transition ${
//             activeMenu === id
//               ? "bg-primary text-white"
//               : "text-muted hover:bg-soft hover:text-primary"
//           }`}
//         >
//           <Icon size={19} />
//           {label}
//         </button>
//       ))}
//     </nav>
//   );
// }

// function AdminStat({
//   icon: Icon,
//   label,
//   value,
// }) {
//   return (
//     <article className="rounded-[22px] border border-earth bg-white p-5 shadow-sm">
//       <div className="flex items-center justify-between">
//         <span className="text-sm font-medium text-muted">
//           {label}
//         </span>

//         <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-soft text-primary">
//           <Icon size={19} />
//         </div>
//       </div>

//       <p className="mt-4 text-3xl font-bold">
//         {value}
//       </p>
//     </article>
//   );
// }

//VERSION 3.0.0 et APPEL A API DJANGO baye bass ADmin DU SITE


import { useEffect, useMemo, useState } from "react";
import {
  CalendarDays,
  ClipboardList,
  LayoutDashboard,
  Leaf,
  Menu,
  Pencil,
  Plus,
  Search,
  Settings,
  Sprout,
  Trash2,
  UserRound,
  Users,
  X,
} from "lucide-react";

import { useAuth } from "../contexts/AuthContext";
import { adminService } from "../services/adminService";
import { cultureService } from "../services/cultureService";

const OFFICIAL_CROPS = [
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

const OFFICIAL_CULTURE_CODES = [
  "riz",
  "mil",
  "mais",
  "sorgho",
  "arachide",
  "niebe",
  "manioc",
  "oignon",
  "mangue",
  "pasteque",
];

const MENU = [
  {
    id: "overview",
    label: "Tableau de bord",
    icon: LayoutDashboard,
  },
  {
    id: "farmers",
    label: "Agriculteurs",
    icon: Users,
  },
  {
    id: "cultures",
    label: "Cultures",
    icon: Sprout,
  },
  {
    id: "calendar",
    label: "Calendriers",
    icon: CalendarDays,
  },
  {
    id: "data",
    label: "Données agricoles",
    icon: ClipboardList,
  },
  {
    id: "profile",
    label: "Mon profil",
    icon: UserRound,
  },
];

export default function AdminDashboard() {
  const { user, logout } = useAuth();

  const [activeMenu, setActiveMenu] = useState("overview");

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const [farmers, setFarmers] = useState([]);

  const [cultureReferences, setCultureReferences] = useState([]);

  const [loading, setLoading] = useState(true);

  const [error, setError] = useState("");

  const [search, setSearch] = useState("");

  const [selectedFarmer, setSelectedFarmer] = useState(null);

  const [modal, setModal] = useState(null);

  const [farmerForm, setFarmerForm] = useState({
    first_name: "",
    last_name: "",
    username: "",
    telephone: "",
    email: "",
    password: "",
  });

  const [cultureForm, setCultureForm] = useState({
    farmer: "",
    culture: "",
    superficie: "",
    date_semis: "",
    type_sol: "sableux",
  });

  /**
   * Charge les données réelles depuis le backend.
   */
  async function loadAdminData() {
    setLoading(true);
    setError("");

    try {
      const [farmersData, cultureData] = await Promise.all([
        adminService.getFarmers(),
        cultureService.getCultureReferences(),
      ]);

      const farmersResult = Array.isArray(farmersData)
        ? farmersData
        : farmersData?.results || [];

      const culturesResult = Array.isArray(cultureData)
        ? cultureData
        : cultureData?.results || [];

      setFarmers(farmersResult);
      setCultureReferences(culturesResult);
    } catch (err) {
      console.error("Erreur chargement admin :", err);

      setError(
        err?.message ||
          "Impossible de charger les données d'administration."
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadAdminData();
  }, []);

  /**
   * Ne garde que les 10 cultures officielles.
   */
  const officialCultureReferences = useMemo(() => {
    return cultureReferences.filter((culture) =>
      OFFICIAL_CULTURE_CODES.includes(culture.code)
    );
  }, [cultureReferences]);

  /**
   * Recherche agriculteur.
   */
  const filteredFarmers = useMemo(() => {
    const query = search.toLowerCase().trim();

    if (!query) {
      return farmers;
    }

    return farmers.filter((farmer) => {
      const location = getFarmerLocation(farmer);

      return [
        farmer.first_name,
        farmer.last_name,
        farmer.username,
        farmer.telephone,
        farmer.email,
        location,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase()
        .includes(query);
    });
  }, [farmers, search]);

  function closeModal() {
    setModal(null);
    setSelectedFarmer(null);
    setError("");
  }

  function openAddFarmer() {
    setError("");

    setFarmerForm({
      first_name: "",
      last_name: "",
      username: "",
      telephone: "",
      email: "",
      password: "",
    });

    setSelectedFarmer(null);
    setModal("farmer");
  }

  function openEditFarmer(farmer) {
    setError("");

    setSelectedFarmer(farmer);

    setFarmerForm({
      first_name: farmer.first_name || "",
      last_name: farmer.last_name || "",
      username: farmer.username || "",
      telephone: farmer.telephone || "",
      email: farmer.email || "",
      password: "",
    });

    setModal("farmer");
  }

  /**
   * Création ou modification d'un agriculteur.
   */
  async function saveFarmer(event) {
    event.preventDefault();

    setError("");

    try {
      let farmer;

      if (selectedFarmer) {
        const payload = {
          first_name: farmerForm.first_name,
          last_name: farmerForm.last_name,
          username: farmerForm.username,
          telephone: farmerForm.telephone,
          email: farmerForm.email,
        };

        /**
         * Le mot de passe est facultatif lors d'une modification.
         * On l'envoie seulement s'il a été renseigné.
         */
        if (farmerForm.password.trim()) {
          payload.password = farmerForm.password;
        }

        farmer = await adminService.updateFarmer(
          selectedFarmer.id,
          payload
        );

        const updatedFarmer =
          farmer?.data || farmer;

        setFarmers((current) =>
          current.map((item) =>
            item.id === updatedFarmer.id
              ? updatedFarmer
              : item
          )
        );
      } else {
        farmer = await adminService.createFarmer({
          first_name: farmerForm.first_name,
          last_name: farmerForm.last_name,
          username: farmerForm.username,
          telephone: farmerForm.telephone,
          email: farmerForm.email,
          password: farmerForm.password,
        });

        const createdFarmer =
          farmer?.data || farmer;

        setFarmers((current) => [
          ...current,
          createdFarmer,
        ]);
      }

      closeModal();
    } catch (err) {
      console.error("Erreur sauvegarde agriculteur :", err);

      setError(
        err?.message ||
          "Impossible d'enregistrer l'agriculteur."
      );
    }
  }

  /**
   * Suppression réelle depuis le backend.
   */
  async function deleteFarmer(farmer) {
    const confirmed = window.confirm(
      `Supprimer l'agriculteur ${farmer.first_name} ${farmer.last_name} ?`
    );

    if (!confirmed) {
      return;
    }

    setError("");

    try {
      await adminService.deleteFarmer(farmer.id);

      setFarmers((current) =>
        current.filter(
          (item) => item.id !== farmer.id
        )
      );
    } catch (err) {
      console.error("Erreur suppression agriculteur :", err);

      setError(
        err?.message ||
          "Impossible de supprimer l'agriculteur."
      );
    }
  }

  function openAddCulture(farmer = null) {
    setError("");

    setCultureForm({
      farmer: farmer ? String(farmer.id) : "",
      culture: "",
      superficie: "",
      date_semis: "",
      type_sol: "sableux",
    });

    setModal("culture");
  }

  /**
   * Ajout réel d'une culture à un agriculteur.
   */
  async function saveCulture(event) {
    event.preventDefault();

    setError("");

    if (!cultureForm.farmer || !cultureForm.culture) {
      setError(
        "Veuillez sélectionner un agriculteur et une culture."
      );
      return;
    }

    try {
      const createdCulture =
        await adminService.addFarmerCulture(
          Number(cultureForm.farmer),
          {
            culture: Number(cultureForm.culture),
            superficie: cultureForm.superficie,
            date_semis: cultureForm.date_semis,
            type_sol: cultureForm.type_sol,
          }
        );

      const cultureResult =
        createdCulture?.data || createdCulture;

      setFarmers((current) =>
        current.map((farmer) => {
          if (
            farmer.id !== Number(cultureForm.farmer)
          ) {
            return farmer;
          }

          return {
            ...farmer,
            cultures_count:
              (farmer.cultures_count || 0) + 1,
            cultures: [
              ...(Array.isArray(farmer.cultures)
                ? farmer.cultures
                : []),
              cultureResult,
            ],
          };
        })
      );

      closeModal();
    } catch (err) {
      console.error("Erreur ajout culture :", err);

      setError(
        err?.message ||
          "Impossible d'ajouter la culture."
      );
    }
  }

  async function handleLogout() {
    await logout();
  }

  const totalCultures = farmers.reduce(
    (total, farmer) =>
      total + Number(farmer.cultures_count || 0),
    0
  );

  const activeFarmers = farmers.filter((farmer) => farmer.is_active).length;

  const cropDistribution = useMemo(() => {
    const counts = new Map();
    farmers.forEach((farmer) => {
      (Array.isArray(farmer.cultures) ? farmer.cultures : []).forEach((culture) => {
        const name = culture.culture_nom || culture.culture?.nom || culture.culture || "Culture non renseignée";
        counts.set(name, (counts.get(name) || 0) + 1);
      });
    });
    return [...counts.entries()]
      .map(([label, value]) => ({ label, value }))
      .sort((left, right) => right.value - left.value || left.label.localeCompare(right.label, "fr"));
  }, [farmers]);

  const regionDistribution = useMemo(() => {
    const counts = new Map();
    farmers.forEach((farmer) => {
      (Array.isArray(farmer.cultures) ? farmer.cultures : []).forEach((culture) => {
        const region = culture.region_nom || culture.region?.nom || "Région non renseignée";
        counts.set(region, (counts.get(region) || 0) + 1);
      });
    });
    return [...counts.entries()]
      .map(([label, value]) => ({ label, value }))
      .sort((left, right) => right.value - left.value || left.label.localeCompare(right.label, "fr"));
  }, [farmers]);

  const coveredRegions = regionDistribution.filter(
    ({ label }) => label !== "Région non renseignée"
  ).length;

  return (
    <div className="min-h-screen bg-sand">
      {/* MOBILE HEADER */}
      <header className="sticky top-0 z-40 flex items-center justify-between border-b border-earth bg-white px-4 py-4 lg:hidden">
        <div>
          <p className="font-display text-xl font-bold">
            Agri-Conseil
          </p>

          <span className="text-xs font-semibold text-muted">
            Administration
          </span>
        </div>

        <button
          type="button"
          onClick={() => setMobileMenuOpen(true)}
          className="rounded-xl border border-earth p-2"
        >
          <Menu size={22} />
        </button>
      </header>

      {/* MOBILE DRAWER */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div
            className="absolute inset-0 bg-black/40"
            onClick={() =>
              setMobileMenuOpen(false)
            }
          />

          <aside className="relative h-full w-[290px] bg-white p-5 shadow-2xl">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-display text-xl font-bold">
                  Agri-Conseil
                </p>

                <span className="text-xs font-semibold text-muted">
                  Administration
                </span>
              </div>

              <button
                type="button"
                onClick={() =>
                  setMobileMenuOpen(false)
                }
                className="rounded-xl border border-earth p-2"
              >
                <X size={20} />
              </button>
            </div>

            <AdminMenu
              activeMenu={activeMenu}
              onChange={(id) => {
                setActiveMenu(id);
                setMobileMenuOpen(false);
              }}
            />

            <button
              type="button"
              onClick={handleLogout}
              className="mt-5 w-full rounded-xl bg-sand px-4 py-3 text-left font-semibold text-ink"
            >
              Se déconnecter
            </button>
          </aside>
        </div>
      )}

      <div className="flex min-h-screen">
        {/* SIDEBAR DESKTOP */}
        <aside className="sticky top-0 hidden h-screen w-[270px] shrink-0 border-r border-earth bg-white p-5 lg:flex lg:flex-col">
          <div className="px-3">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary text-white">
                <Leaf size={21} />
              </div>

              <div>
                <p className="font-display text-xl font-bold">
                  Agri-Conseil
                </p>

                <span className="text-xs font-semibold text-muted">
                  Administration
                </span>
              </div>
            </div>
          </div>

          <AdminMenu
            activeMenu={activeMenu}
            onChange={setActiveMenu}
          />

          <div className="mt-auto">
            <div className="mb-4 rounded-2xl bg-soft p-4">
              <p className="text-xs font-bold uppercase tracking-[0.1em] text-primary">
                Administrateur
              </p>

              <p className="mt-2 font-semibold">
                {user?.first_name ||
                  user?.username ||
                  "Administrateur"}
              </p>
            </div>

            <button
              type="button"
              onClick={handleLogout}
              className="w-full rounded-xl border border-earth px-4 py-3 text-left font-semibold transition hover:border-primary hover:text-primary"
            >
              Se déconnecter
            </button>
          </div>
        </aside>

        {/* CONTENU */}
        <main className="min-w-0 flex-1 px-4 py-6 sm:px-6 lg:px-10 lg:py-10">
          {/* HEADER CONTENU */}
          <header className="mb-8">
            <p className="text-xs font-extrabold uppercase tracking-[0.12em] text-primary">
              Administration
            </p>

            <div className="mt-2 flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
              <div>
                <h1 className="font-display text-4xl tracking-[-0.04em]">
                  {activeMenu === "overview" &&
                    "Tableau de bord"}

                  {activeMenu === "farmers" &&
                    "Gestion des agriculteurs"}

                  {activeMenu === "cultures" &&
                    "Gestion des cultures"}

                  {activeMenu === "calendar" &&
                    "Calendriers agricoles"}

                  {activeMenu === "data" &&
                    "Données agricoles"}

                  {activeMenu === "profile" &&
                    "Mon profil"}
                </h1>

                <p className="mt-2 max-w-2xl text-muted">
                  Gérez les utilisateurs et les données de la
                  plateforme Agri-Conseil.
                </p>
              </div>
            </div>
          </header>

          {/* ERREUR */}
          {error && (
            <div className="mb-6 rounded-2xl border border-red-200 bg-red-50 px-5 py-4 text-sm font-medium text-red-700">
              {error}
            </div>
          )}

          {/* CHARGEMENT */}
          {loading ? (
            <section className="flex min-h-[350px] items-center justify-center rounded-[24px] border border-earth bg-white">
              <div className="text-center">
                <div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-earth border-t-primary" />

                <p className="mt-4 font-semibold">
                  Chargement des données...
                </p>

                <p className="mt-1 text-sm text-muted">
                  Connexion au serveur Agri-Conseil
                </p>
              </div>
            </section>
          ) : (
            <>
              {/* TABLEAU DE BORD */}
              {activeMenu === "overview" && (
                <section className="space-y-6">
                  <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                    <AdminStat
                      icon={Users}
                      label="Agriculteurs"
                      value={farmers.length}
                    />

                    <AdminStat
                      icon={Users}
                      label="Comptes actifs"
                      value={activeFarmers}
                    />

                    <AdminStat
                      icon={Sprout}
                      label="Cultures suivies"
                      value={totalCultures}
                    />

                    <AdminStat
                      icon={CalendarDays}
                      label="Régions couvertes"
                      value={coveredRegions}
                    />
                  </div>

                  <div className="grid gap-5 xl:grid-cols-2">
                    <DonutChart
                      title="Cultures suivies"
                      description="Parcelles enregistrées par culture"
                      data={cropDistribution}
                    />

                    <RegionBarChart data={regionDistribution} />
                  </div>

                  <div className="grid gap-5 xl:grid-cols-2">
                    <article className="rounded-[24px] border border-earth bg-white p-6 shadow-sm">
                      <div className="flex items-center justify-between">
                        <div>
                          <span className="text-xs font-extrabold uppercase tracking-[0.1em] text-primary">
                            Activité
                          </span>

                          <h2 className="mt-1 text-2xl font-bold">
                            Agriculteurs
                          </h2>
                        </div>

                        <Users
                          size={22}
                          className="text-primary"
                        />
                      </div>

                      <div className="mt-6 space-y-3">
                        {farmers
                          .slice(0, 5)
                          .map((farmer) => (
                            <div
                              key={farmer.id}
                              className="flex items-center justify-between rounded-xl bg-sand p-4"
                            >
                              <div>
                                <p className="font-semibold">
                                  {farmer.first_name}{" "}
                                  {farmer.last_name}
                                </p>

                                <p className="text-sm text-muted">
                                  {getFarmerLocation(
                                    farmer
                                  )}
                                </p>
                              </div>

                              <span className="rounded-full bg-soft px-3 py-1 text-xs font-bold text-primary">
                                {farmer.cultures_count ||
                                  0}{" "}
                                culture
                                {Number(
                                  farmer.cultures_count || 0
                                ) > 1
                                  ? "s"
                                  : ""}
                              </span>
                            </div>
                          ))}

                        {farmers.length === 0 && (
                          <p className="rounded-xl bg-sand p-4 text-sm text-muted">
                            Aucun agriculteur enregistré.
                          </p>
                        )}
                      </div>
                    </article>

                    <article className="rounded-[24px] border border-primary/20 bg-primary p-6 text-white">
                      <span className="text-xs font-extrabold uppercase tracking-[0.1em] text-white/70">
                        Référentiel
                      </span>

                      <h2 className="mt-1 font-display text-3xl">
                        Les 10 cultures officielles
                      </h2>

                      <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3">
                        {OFFICIAL_CROPS.map((crop) => (
                          <div
                            key={crop}
                            className="rounded-xl bg-white/10 px-3 py-3 text-sm font-semibold"
                          >
                            {crop}
                          </div>
                        ))}
                      </div>

                      <p className="mt-6 text-sm leading-6 text-white/75">
                        Ce référentiel reste limité aux 10
                        cultures définies pour Agri-Conseil.
                      </p>
                    </article>
                  </div>
                </section>
              )}

              {/* AGRICULTEURS */}
              {activeMenu === "farmers" && (
                <section className="space-y-5">
                  <div className="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
                    <div className="relative w-full xl:max-w-md">
                      <Search
                        size={19}
                        className="absolute left-4 top-1/2 -translate-y-1/2 text-muted"
                      />

                      <input
                        value={search}
                        onChange={(e) =>
                          setSearch(e.target.value)
                        }
                        placeholder="Rechercher un agriculteur..."
                        className="w-full rounded-xl border border-earth bg-white py-3 pl-11 pr-4 outline-none focus:border-primary"
                      />
                    </div>

                    <button
                      type="button"
                      onClick={openAddFarmer}
                      className="inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-5 py-3 font-semibold text-white"
                    >
                      <Plus size={18} />
                      Ajouter un agriculteur
                    </button>
                  </div>

                  {/* TABLE DESKTOP */}
                  <div className="hidden overflow-hidden rounded-[24px] border border-earth bg-white shadow-sm lg:block">
                    <div className="overflow-x-auto">
                      <table className="w-full border-collapse">
                        <thead className="bg-sand">
                          <tr className="text-left text-xs font-extrabold uppercase tracking-[0.08em] text-muted">
                            <th className="px-6 py-4">
                              Agriculteur
                            </th>

                            <th className="px-6 py-4">
                              Contact
                            </th>

                            <th className="px-6 py-4">
                              Localisation
                            </th>

                            <th className="px-6 py-4">
                              Cultures
                            </th>

                            <th className="px-6 py-4 text-right">
                              Actions
                            </th>
                          </tr>
                        </thead>

                        <tbody>
                          {filteredFarmers.map(
                            (farmer) => (
                              <tr
                                key={farmer.id}
                                className="border-t border-earth/70"
                              >
                                <td className="px-6 py-5">
                                  <p className="font-bold">
                                    {farmer.first_name}{" "}
                                    {farmer.last_name}
                                  </p>

                                  <p className="text-sm text-muted">
                                    @{farmer.username}
                                  </p>
                                </td>

                                <td className="px-6 py-5 text-sm">
                                  <p>
                                    {farmer.telephone ||
                                      "—"}
                                  </p>

                                  <p className="text-muted">
                                    {farmer.email || "—"}
                                  </p>
                                </td>

                                <td className="px-6 py-5 text-sm">
                                  {getFarmerLocation(
                                    farmer
                                  )}
                                </td>

                                <td className="px-6 py-5">
                                  <span className="rounded-full bg-soft px-3 py-1 text-xs font-bold text-primary">
                                    {farmer.cultures_count ||
                                      0}
                                  </span>
                                </td>

                                <td className="px-6 py-5">
                                  <div className="flex justify-end gap-2">
                                    <button
                                      type="button"
                                      onClick={() =>
                                        openAddCulture(
                                          farmer
                                        )
                                      }
                                      title="Ajouter une culture"
                                      className="rounded-lg border border-earth p-2 text-primary hover:border-primary"
                                    >
                                      <Plus
                                        size={17}
                                      />
                                    </button>

                                    <button
                                      type="button"
                                      onClick={() =>
                                        openEditFarmer(
                                          farmer
                                        )
                                      }
                                      title="Modifier"
                                      className="rounded-lg border border-earth p-2 hover:border-primary hover:text-primary"
                                    >
                                      <Pencil
                                        size={17}
                                      />
                                    </button>

                                    <button
                                      type="button"
                                      onClick={() =>
                                        deleteFarmer(
                                          farmer
                                        )
                                      }
                                      title="Supprimer"
                                      className="rounded-lg border border-earth p-2 text-red-600 hover:border-red-300"
                                    >
                                      <Trash2
                                        size={17}
                                      />
                                    </button>
                                  </div>
                                </td>
                              </tr>
                            )
                          )}

                          {filteredFarmers.length ===
                            0 && (
                            <tr>
                              <td
                                colSpan="5"
                                className="px-6 py-10 text-center text-sm text-muted"
                              >
                                Aucun agriculteur trouvé.
                              </td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  {/* MOBILE */}
                  <div className="space-y-3 lg:hidden">
                    {filteredFarmers.map((farmer) => (
                      <article
                        key={farmer.id}
                        className="rounded-2xl border border-earth bg-white p-5 shadow-sm"
                      >
                        <div className="flex items-start justify-between gap-4">
                          <div>
                            <h3 className="text-lg font-bold">
                              {farmer.first_name}{" "}
                              {farmer.last_name}
                            </h3>

                            <p className="text-sm text-muted">
                              @{farmer.username}
                            </p>
                          </div>

                          <span className="rounded-full bg-soft px-3 py-1 text-xs font-bold text-primary">
                            {farmer.cultures_count ||
                              0}{" "}
                            culture
                            {Number(
                              farmer.cultures_count || 0
                            ) > 1
                              ? "s"
                              : ""}
                          </span>
                        </div>

                        <div className="mt-4 space-y-2 text-sm text-muted">
                          <p>
                            {farmer.telephone || "—"}
                          </p>

                          <p>
                            {farmer.email || "—"}
                          </p>

                          <p>
                            {getFarmerLocation(farmer)}
                          </p>
                        </div>

                        <div className="mt-4 flex gap-2">
                          <button
                            type="button"
                            onClick={() =>
                              openAddCulture(farmer)
                            }
                            className="flex-1 rounded-xl border border-earth py-2.5 text-sm font-semibold text-primary"
                          >
                            Ajouter culture
                          </button>

                          <button
                            type="button"
                            onClick={() =>
                              openEditFarmer(farmer)
                            }
                            className="rounded-xl border border-earth p-2.5"
                          >
                            <Pencil size={17} />
                          </button>

                          <button
                            type="button"
                            onClick={() =>
                              deleteFarmer(farmer)
                            }
                            className="rounded-xl border border-earth p-2.5 text-red-600"
                          >
                            <Trash2 size={17} />
                          </button>
                        </div>
                      </article>
                    ))}

                    {filteredFarmers.length === 0 && (
                      <div className="rounded-2xl border border-earth bg-white p-6 text-center text-sm text-muted">
                        Aucun agriculteur trouvé.
                      </div>
                    )}
                  </div>
                </section>
              )}

              {/* CULTURES */}
              {activeMenu === "cultures" && (
                <section className="rounded-[24px] border border-earth bg-white p-6 shadow-sm">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-xs font-extrabold uppercase tracking-[0.1em] text-primary">
                        Référentiel
                      </span>

                      <h2 className="mt-1 font-display text-3xl">
                        Les 10 cultures d'Agri-Conseil
                      </h2>
                    </div>

                    <Leaf
                      size={24}
                      className="text-primary"
                    />
                  </div>

                  <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {officialCultureReferences.length >
                    0 ? (
                      officialCultureReferences.map(
                        (culture, index) => (
                          <article
                            key={culture.id}
                            className="rounded-2xl border border-earth p-5"
                          >
                            <span className="text-xs font-bold text-primary">
                              {String(
                                index + 1
                              ).padStart(2, "0")}
                            </span>

                            <h3 className="mt-2 text-lg font-bold">
                              {culture.nom}
                            </h3>

                            <p className="mt-2 text-sm leading-6 text-muted">
                              {culture.description ||
                                "Culture référencée dans Agri-Conseil."}
                            </p>
                          </article>
                        )
                      )
                    ) : (
                      <div className="rounded-2xl bg-sand p-5 text-sm text-muted sm:col-span-2 lg:col-span-3">
                        Aucun référentiel de culture disponible.
                      </div>
                    )}
                  </div>
                </section>
              )}

              {/* CALENDRIERS */}
              {activeMenu === "calendar" && (
                <section className="rounded-[24px] border border-earth bg-white p-6 shadow-sm">
                  <span className="text-xs font-extrabold uppercase tracking-[0.1em] text-primary">
                    Administration
                  </span>

                  <h2 className="mt-1 font-display text-3xl">
                    Gestion des calendriers
                  </h2>

                  <p className="mt-3 max-w-2xl leading-7 text-muted">
                    Cette section servira à consulter et
                    administrer les règles utilisées pour
                    générer automatiquement les calendriers
                    agricoles.
                  </p>

                  <div className="mt-7 rounded-2xl bg-sand p-5">
                    <p className="font-semibold">
                      Règles du calendrier
                    </p>

                    <p className="mt-2 text-sm leading-6 text-muted">
                      Les durées et opérations dépendent de
                      chaque culture et de son cycle.
                    </p>
                  </div>
                </section>
              )}

              {/* DONNEES */}
              {activeMenu === "data" && (
                <section className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
                  {[
                    [
                      "Référentiel géographique",
                      "Régions, départements et communes/localités.",
                    ],
                    [
                      "Données météorologiques",
                      "Paramètres nécessaires aux services météo.",
                    ],
                    [
                      "Données agronomiques",
                      "Cycles, besoins en eau, stades et règles.",
                    ],
                  ].map(([title, description]) => (
                    <article
                      key={title}
                      className="rounded-[24px] border border-earth bg-white p-6 shadow-sm"
                    >
                      <Settings
                        size={23}
                        className="text-primary"
                      />

                      <h2 className="mt-5 text-xl font-bold">
                        {title}
                      </h2>

                      <p className="mt-2 leading-6 text-muted">
                        {description}
                      </p>
                    </article>
                  ))}
                </section>
              )}

              {/* PROFIL ADMIN */}
              {activeMenu === "profile" && (
                <section className="rounded-[24px] border border-earth bg-white p-6 shadow-sm sm:p-8">
                  <div className="flex items-center gap-4">
                    <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary text-white">
                      <UserRound size={28} />
                    </div>

                    <div>
                      <span className="text-xs font-extrabold uppercase tracking-[0.1em] text-primary">
                        Administrateur
                      </span>

                      <h2 className="mt-1 font-display text-3xl">
                        Mon profil
                      </h2>
                    </div>
                  </div>

                  <div className="mt-8 grid gap-4 sm:grid-cols-2">
                    <div className="rounded-xl bg-sand p-4">
                      <span className="text-sm text-muted">
                        Nom d'utilisateur
                      </span>

                      <p className="mt-1 font-bold">
                        {user?.username || "—"}
                      </p>
                    </div>

                    <div className="rounded-xl bg-sand p-4">
                      <span className="text-sm text-muted">
                        Email
                      </span>

                      <p className="mt-1 font-bold">
                        {user?.email || "—"}
                      </p>
                    </div>
                  </div>
                </section>
              )}
            </>
          )}
        </main>
      </div>

      {/* MODAL AGRICULTEUR */}
      {modal === "farmer" && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/45 px-4 py-6">
          <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-[24px] bg-white p-6 shadow-2xl sm:p-8">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-xs font-extrabold uppercase tracking-[0.1em] text-primary">
                  Gestion agriculteur
                </span>

                <h2 className="mt-1 font-display text-3xl">
                  {selectedFarmer
                    ? "Modifier l'agriculteur"
                    : "Ajouter un agriculteur"}
                </h2>
              </div>

              <button
                type="button"
                onClick={closeModal}
                className="rounded-xl border border-earth p-2"
              >
                <X size={20} />
              </button>
            </div>

            <form
              onSubmit={saveFarmer}
              className="mt-7 grid gap-4 sm:grid-cols-2"
            >
              <input
                type="text"
                value={farmerForm.first_name}
                onChange={(e) =>
                  setFarmerForm({
                    ...farmerForm,
                    first_name: e.target.value,
                  })
                }
                placeholder="Prénom"
                className="rounded-xl border border-earth px-4 py-3 outline-none focus:border-primary"
                required
              />

              <input
                type="text"
                value={farmerForm.last_name}
                onChange={(e) =>
                  setFarmerForm({
                    ...farmerForm,
                    last_name: e.target.value,
                  })
                }
                placeholder="Nom"
                className="rounded-xl border border-earth px-4 py-3 outline-none focus:border-primary"
                required
              />

              <input
                type="text"
                value={farmerForm.username}
                onChange={(e) =>
                  setFarmerForm({
                    ...farmerForm,
                    username: e.target.value,
                  })
                }
                placeholder="Nom d'utilisateur"
                className="rounded-xl border border-earth px-4 py-3 outline-none focus:border-primary"
                required
              />

              <input
                type="text"
                value={farmerForm.telephone}
                onChange={(e) =>
                  setFarmerForm({
                    ...farmerForm,
                    telephone: e.target.value,
                  })
                }
                placeholder="Téléphone"
                className="rounded-xl border border-earth px-4 py-3 outline-none focus:border-primary"
                required
              />

              <input
                type="email"
                value={farmerForm.email}
                onChange={(e) =>
                  setFarmerForm({
                    ...farmerForm,
                    email: e.target.value,
                  })
                }
                placeholder="Email"
                className="rounded-xl border border-earth px-4 py-3 outline-none focus:border-primary sm:col-span-2"
                required
              />

              <input
                type="password"
                value={farmerForm.password}
                onChange={(e) =>
                  setFarmerForm({
                    ...farmerForm,
                    password: e.target.value,
                  })
                }
                placeholder={
                  selectedFarmer
                    ? "Nouveau mot de passe (facultatif)"
                    : "Mot de passe"
                }
                minLength={8}
                required={!selectedFarmer}
                className="rounded-xl border border-earth px-4 py-3 outline-none focus:border-primary sm:col-span-2"
              />

              <div className="flex gap-3 sm:col-span-2">
                <button
                  type="submit"
                  className="flex-1 rounded-xl bg-primary px-5 py-3 font-semibold text-white"
                >
                  Enregistrer
                </button>

                <button
                  type="button"
                  onClick={closeModal}
                  className="rounded-xl border border-earth px-5 py-3 font-semibold"
                >
                  Annuler
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL CULTURE */}
      {modal === "culture" && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/45 px-4 py-6">
          <div className="w-full max-w-2xl rounded-[24px] bg-white p-6 shadow-2xl sm:p-8">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-xs font-extrabold uppercase tracking-[0.1em] text-primary">
                  Nouvelle culture
                </span>

                <h2 className="mt-1 font-display text-3xl">
                  Ajouter une culture
                </h2>
              </div>

              <button
                type="button"
                onClick={closeModal}
                className="rounded-xl border border-earth p-2"
              >
                <X size={20} />
              </button>
            </div>

            <form
              onSubmit={saveCulture}
              className="mt-7 grid gap-4 sm:grid-cols-2"
            >
              <select
                value={cultureForm.farmer}
                onChange={(e) =>
                  setCultureForm({
                    ...cultureForm,
                    farmer: e.target.value,
                  })
                }
                className="rounded-xl border border-earth bg-white px-4 py-3 outline-none focus:border-primary sm:col-span-2"
                required
              >
                <option value="">
                  Choisir l'agriculteur
                </option>

                {farmers.map((farmer) => (
                  <option
                    key={farmer.id}
                    value={farmer.id}
                  >
                    {farmer.first_name}{" "}
                    {farmer.last_name}
                  </option>
                ))}
              </select>

              <select
                value={cultureForm.culture}
                onChange={(e) =>
                  setCultureForm({
                    ...cultureForm,
                    culture: e.target.value,
                  })
                }
                className="rounded-xl border border-earth bg-white px-4 py-3 outline-none focus:border-primary"
                required
              >
                <option value="">
                  Choisir une culture
                </option>

                {officialCultureReferences.map(
                  (culture) => (
                    <option
                      key={culture.id}
                      value={culture.id}
                    >
                      {culture.nom}
                    </option>
                  )
                )}
              </select>

              <input
                type="number"
                min="0.01"
                step="0.01"
                value={cultureForm.superficie}
                onChange={(e) =>
                  setCultureForm({
                    ...cultureForm,
                    superficie: e.target.value,
                  })
                }
                placeholder="Superficie (ha)"
                className="rounded-xl border border-earth px-4 py-3 outline-none focus:border-primary"
                required
              />

              <input
                type="date"
                value={cultureForm.date_semis}
                onChange={(e) =>
                  setCultureForm({
                    ...cultureForm,
                    date_semis: e.target.value,
                  })
                }
                className="rounded-xl border border-earth px-4 py-3 outline-none focus:border-primary"
                required
              />

              <select
                value={cultureForm.type_sol}
                onChange={(e) =>
                  setCultureForm({
                    ...cultureForm,
                    type_sol: e.target.value,
                  })
                }
                className="rounded-xl border border-earth bg-white px-4 py-3 outline-none focus:border-primary"
              >
                <option value="sableux">
                  Sol sableux
                </option>

                <option value="argileux">
                  Sol argileux
                </option>

                <option value="limoneux">
                  Sol limoneux
                </option>

                <option value="sablo-limoneux">
                  Sol sablo-limoneux
                </option>
              </select>

              <button
                type="submit"
                className="rounded-xl bg-primary px-5 py-3 font-semibold text-white sm:col-span-2"
              >
                Ajouter la culture
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

const CHART_COLORS = ["#047443", "#3B9B68", "#A1CDAF", "#E1B45A", "#7297A8", "#D48B67", "#7E78A8", "#9B7A55", "#55A6A0", "#A4A4A4"];

function DonutChart({ title, description, data }) {
  const total = data.reduce((sum, item) => sum + item.value, 0);
  const circumference = 2 * Math.PI * 42;
  const segments = data.map((item, index) => ({
    ...item,
    color: CHART_COLORS[index % CHART_COLORS.length],
    length: total ? (item.value / total) * circumference : 0,
    offset: data
      .slice(0, index)
      .reduce((sum, previous) => sum + (previous.value / total) * circumference, 0),
  }));

  return (
    <article className="rounded-[24px] border border-earth bg-white p-6 shadow-sm">
      <div>
        <h2 className="text-xl font-bold">{title}</h2>
        <p className="mt-1 text-sm text-muted">{description}</p>
      </div>

      {total === 0 ? (
        <p className="mt-6 rounded-xl bg-sand p-4 text-sm text-muted">Aucune culture enregistrée pour le moment.</p>
      ) : (
        <div className="mt-5 flex flex-col items-center gap-6 sm:flex-row">
          <div className="relative h-40 w-40 shrink-0" role="img" aria-label={`${total} cultures suivies, réparties par culture`}>
            <svg viewBox="0 0 120 120" className="h-full w-full -rotate-90" aria-hidden="true">
              <circle cx="60" cy="60" r="42" fill="none" stroke="#E8E3D7" strokeWidth="16" />
              {segments.map((item) => {
                return (
                  <circle
                    key={item.label}
                    cx="60"
                    cy="60"
                    r="42"
                    fill="none"
                    stroke={item.color}
                    strokeWidth="16"
                    strokeDasharray={`${item.length} ${circumference - item.length}`}
                    strokeDashoffset={-item.offset}
                  />
                );
              })}
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-3xl font-bold text-[#18382A]">{total}</span>
              <span className="text-xs text-muted">parcelles</span>
            </div>
          </div>

          <ul className="grid w-full grid-cols-1 gap-2 sm:grid-cols-2">
            {data.map((item, index) => (
              <li key={item.label} className="flex min-w-0 items-center gap-2 text-sm">
                <span className="h-2.5 w-2.5 shrink-0 rounded-full" style={{ backgroundColor: CHART_COLORS[index % CHART_COLORS.length] }} />
                <span className="truncate text-muted" title={item.label}>{item.label}</span>
                <strong className="ml-auto">{item.value}</strong>
              </li>
            ))}
          </ul>
        </div>
      )}
    </article>
  );
}

function RegionBarChart({ data }) {
  const visibleRegions = data.filter(({ label }) => label !== "Région non renseignée").slice(0, 7);
  const maximum = Math.max(1, ...visibleRegions.map((item) => item.value));

  return (
    <article className="rounded-[24px] border border-earth bg-white p-6 shadow-sm">
      <div>
        <h2 className="text-xl font-bold">Activité par région</h2>
        <p className="mt-1 text-sm text-muted">Cultures suivies enregistrées dans chaque région</p>
      </div>

      {visibleRegions.length === 0 ? (
        <p className="mt-6 rounded-xl bg-sand p-4 text-sm text-muted">Les régions apparaîtront ici dès que des cultures y seront enregistrées.</p>
      ) : (
        <div className="mt-6 space-y-4" role="img" aria-label="Nombre de cultures suivies par région">
          {visibleRegions.map((item) => (
            <div key={item.label}>
              <div className="mb-1.5 flex items-center justify-between gap-3 text-sm">
                <span className="truncate font-medium" title={item.label}>{item.label}</span>
                <strong>{item.value}</strong>
              </div>
              <div className="h-3 overflow-hidden rounded-full bg-[#EAF1E8]">
                <div className="h-full rounded-full bg-primary transition-[width]" style={{ width: `${Math.max(5, (item.value / maximum) * 100)}%` }} />
              </div>
            </div>
          ))}
        </div>
      )}
    </article>
  );
}

function AdminMenu({ activeMenu, onChange }) {
  return (
    <nav className="mt-8 space-y-2">
      {MENU.map(({ id, label, icon: Icon }) => (
        <button
          key={id}
          type="button"
          onClick={() => onChange(id)}
          className={`flex w-full items-center gap-3 rounded-xl px-4 py-3 text-left text-sm font-semibold transition ${
            activeMenu === id
              ? "bg-primary text-white"
              : "text-muted hover:bg-soft hover:text-primary"
          }`}
        >
          <Icon size={19} />
          {label}
        </button>
      ))}
    </nav>
  );
}

function AdminStat({
  icon: Icon,
  label,
  value,
}) {
  return (
    <article className="rounded-[22px] border border-earth bg-white p-5 shadow-sm">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-muted">
          {label}
        </span>

        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-soft text-primary">
          <Icon size={19} />
        </div>
      </div>

      <p className="mt-4 text-3xl font-bold">
        {value}
      </p>
    </article>
  );
}

/**
 * Récupère une localisation depuis les données
 * réellement renvoyées par le backend.
 *
 * On accepte plusieurs formes possibles pour éviter
 * que l'affichage casse selon le serializer utilisé.
 */
function getFarmerLocation(farmer) {
  if (farmer?.location) {
    return farmer.location;
  }

  const firstCulture =
    Array.isArray(farmer?.cultures) &&
    farmer.cultures.length > 0
      ? farmer.cultures[0]
      : null;

  if (!firstCulture) {
    return "Non renseignée";
  }

  const commune =
    firstCulture.commune?.nom ||
    firstCulture.commune_nom ||
    firstCulture.localite ||
    "";

  const departement =
    firstCulture.departement?.nom ||
    firstCulture.departement_nom ||
    "";

  const region =
    firstCulture.region?.nom ||
    firstCulture.region_nom ||
    "";

  return [commune, departement, region]
    .filter(Boolean)
    .join(", ") || "Non renseignée";
}
