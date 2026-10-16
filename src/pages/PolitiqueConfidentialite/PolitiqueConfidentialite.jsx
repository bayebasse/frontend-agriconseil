import { ShieldCheck } from "lucide-react";

export default function PolitiqueConfidentialite() {
  return (
    <main className="min-h-screen bg-[#F3F8F2] px-4 py-12 sm:px-6 sm:py-16">
      <div className="mx-auto max-w-[900px]">
        <div className="rounded-2xl border border-[#DCE9DE] bg-white p-6 shadow-[0_12px_35px_rgba(18,61,43,0.06)] sm:p-10 lg:p-12">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-[#E5F4E9] text-[#036A38]">
            <ShieldCheck size={29} />
          </div>

          <p className="mt-6 text-sm font-bold uppercase tracking-[0.12em] text-[#036A38]">
            Agri-Conseil
          </p>

          <h1 className="mt-2 text-3xl font-bold leading-tight tracking-tight text-[#123D2B] sm:text-4xl">
            Politique de confidentialité
          </h1>

          <p className="mt-5 text-base leading-7 text-[#475569]">
            Que faisons-nous de vos informations personnelles ?
          </p>

          <div className="mt-8 rounded-xl bg-[#F3F8F2] p-5 sm:p-6">
            <p className="text-base leading-7 text-[#334155]">
              Les informations personnelles peuvent être utilisées pour les
              finalités suivantes :
            </p>

            <ul className="mt-5 space-y-4 text-sm leading-7 text-[#475569] sm:text-base">
              <li className="flex gap-3">
                <span className="mt-2 h-2 w-2 shrink-0 rounded-full bg-[#036A38]" />
                Vous contacter et communiquer avec vous si vous le souhaitez.
              </li>

              <li className="flex gap-3">
                <span className="mt-2 h-2 w-2 shrink-0 rounded-full bg-[#036A38]" />
                Améliorer et personnaliser votre expérience avec les services
                d’Agri-Conseil.
              </li>

              <li className="flex gap-3">
                <span className="mt-2 h-2 w-2 shrink-0 rounded-full bg-[#036A38]" />
                Vous envoyer des mises à jour, des notifications et des
                annonces relatives au service, lorsque vous y consentez.
              </li>

              <li className="flex gap-3">
                <span className="mt-2 h-2 w-2 shrink-0 rounded-full bg-[#036A38]" />
                Protéger les droits de nos utilisateurs, de nos partenaires
                et ceux d’Agri-Conseil.
              </li>

              <li className="flex gap-3">
                <span className="mt-2 h-2 w-2 shrink-0 rounded-full bg-[#036A38]" />
                Faire respecter les conditions légales d’utilisation des
                services.
              </li>

              <li className="flex gap-3">
                <span className="mt-2 h-2 w-2 shrink-0 rounded-full bg-[#036A38]" />
                Entreprendre les actions nécessaires en cas de litige ou de
                procédure judiciaire.
              </li>

              <li className="flex gap-3">
                <span className="mt-2 h-2 w-2 shrink-0 rounded-full bg-[#036A38]" />
                Prévenir et traiter les fraudes, les détournements de fonds,
                les infractions, les vols d’identité, les cyberattaques et
                les utilisations abusives des services.
              </li>

              <li className="flex gap-3">
                <span className="mt-2 h-2 w-2 shrink-0 rounded-full bg-[#036A38]" />
                Répondre aux demandes et aux ordres des organismes et
                autorités légalement habilités.
              </li>
            </ul>
          </div>

          <p className="mt-7 text-sm leading-6 text-[#64748B]">
            Cette page présente les finalités envisagées pour l’utilisation
            des informations personnelles. La politique définitive devra
            préciser les données réellement collectées, leur durée de
            conservation, les destinataires et les droits des utilisateurs,
            conformément à la réglementation applicable au Sénégal.
          </p>
        </div>
      </div>
    </main>
  );
}