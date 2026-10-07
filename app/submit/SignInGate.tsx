import { signIn } from "@/auth";
import { getT } from "@/lib/i18n";

export default async function SignInGate() {
  const t = await getT();
  return (
    <div className="card p-8 sm:p-10">
      <div className="text-4xl">🔐</div>
      <h2 className="font-display font-bold text-2xl text-ink mt-4">
        {t("submit.gate.title")}
      </h2>
      <p className="text-ash mt-3 max-w-lg leading-relaxed">
        {t("submit.gate.body")}
      </p>

      <form
        action={async () => {
          "use server";
          await signIn("google", { redirectTo: "/submit" });
        }}
        className="mt-6"
      >
        <button
          type="submit"
          className="btn bg-white border border-line shadow-soft hover:shadow-lift transition-all !pl-3"
        >
          <GoogleG />
          <span className="text-ink font-medium">{t("submit.gate.button")}</span>
        </button>
      </form>

      <ul className="mt-8 grid sm:grid-cols-2 gap-3 text-sm text-ash">
        <li className="flex gap-2"><span className="text-ggreen font-bold mt-0.5">✓</span><span>{t("submit.gate.p1")}</span></li>
        <li className="flex gap-2"><span className="text-ggreen font-bold mt-0.5">✓</span><span>{t("submit.gate.p2")}</span></li>
        <li className="flex gap-2"><span className="text-ggreen font-bold mt-0.5">✓</span><span>{t("submit.gate.p3")}</span></li>
        <li className="flex gap-2"><span className="text-ggreen font-bold mt-0.5">✓</span><span>{t("submit.gate.p4")}</span></li>
      </ul>
    </div>
  );
}

function GoogleG() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" aria-hidden>
      <path fill="#4285F4" d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844a4.14 4.14 0 0 1-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.874 2.684-6.615z"/>
      <path fill="#34A853" d="M9 18c2.43 0 4.467-.806 5.956-2.184l-2.908-2.258c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.583-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18z"/>
      <path fill="#FBBC04" d="M3.964 10.707A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.707V4.961H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.039l3.007-2.332z"/>
      <path fill="#EA4335" d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.961l3.007 2.332C4.672 5.163 6.656 3.58 9 3.58z"/>
    </svg>
  );
}
