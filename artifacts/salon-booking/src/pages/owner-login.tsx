import { useState } from "react";
import { useLocation } from "wouter";
import { Layout } from "@/components/Layout";
import { Button, Input, Label } from "@/components/ui";
import { useSalons, useCreateSalon, useSalonLogin, setSalonAuth } from "@/hooks/use-salons";
import { LogIn, UserPlus, Lock, Eye, EyeOff, Store, ChevronRight, Search } from "lucide-react";

type Tab = "login" | "register";

export default function OwnerLogin() {
  const [, navigate] = useLocation();
  const [tab, setTab] = useState<Tab>("login");

  // Login state
  const { data: allSalons } = useSalons();
  const salonLogin = useSalonLogin();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedSalon, setSelectedSalon] = useState<{ id: number; name: string } | null>(null);
  const [loginPin, setLoginPin] = useState("");
  const [showLoginPin, setShowLoginPin] = useState(false);
  const [loginError, setLoginError] = useState("");

  // Register state
  const createSalon = useCreateSalon();
  const [registerPin, setRegisterPin] = useState("");
  const [showRegisterPin, setShowRegisterPin] = useState(false);
  const [registerError, setRegisterError] = useState("");

  const filteredSalons = allSalons?.filter(s =>
    s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    s.phone.includes(searchQuery)
  ) ?? [];

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSalon) return;
    setLoginError("");
    salonLogin.mutate(
      { data: { salonId: selectedSalon.id, pin: loginPin } },
      {
        onSuccess: (salon) => {
          setSalonAuth({ salonId: salon.id, salonName: salon.name });
          navigate(`/owner/${salon.id}`);
        },
        onError: () => {
          setLoginError("Galat PIN hai. Dobara try karein.");
          setLoginPin("");
        },
      }
    );
  };

  const handleRegisterSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (registerPin.length !== 4) {
      setRegisterError("PIN exactly 4 numbers ka hona chahiye.");
      return;
    }
    setRegisterError("");
    const fd = new FormData(e.currentTarget);
    createSalon.mutate(
      {
        data: {
          name: fd.get("name") as string,
          ownerName: fd.get("ownerName") as string,
          phone: fd.get("phone") as string,
          address: fd.get("address") as string,
          openTime: fd.get("openTime") as string,
          closeTime: fd.get("closeTime") as string,
          pin: registerPin,
        },
      },
      {
        onSuccess: (salon) => {
          setSalonAuth({ salonId: salon.id, salonName: salon.name });
          navigate(`/owner/${salon.id}`);
        },
      }
    );
  };

  return (
    <Layout title="Owner Portal" backLink="/">
      <div className="max-w-lg mx-auto">
        <div className="text-center mb-10">
          <div className="w-16 h-16 bg-primary/10 text-primary rounded-2xl flex items-center justify-center mx-auto mb-5">
            <Store className="w-8 h-8" />
          </div>
          <h1 className="font-display text-4xl font-bold text-foreground mb-3">Owner Portal</h1>
          <p className="text-muted-foreground text-lg">
            Apne salon ka dashboard kholein ya naya salon register karein.
          </p>
        </div>

        {/* Tab switcher */}
        <div className="flex bg-muted rounded-2xl p-1.5 mb-8">
          <button
            onClick={() => { setTab("login"); setLoginError(""); setSelectedSalon(null); setLoginPin(""); setSearchQuery(""); }}
            className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-xl font-semibold text-sm transition-all duration-200 ${
              tab === "login"
                ? "bg-background text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <LogIn className="w-4 h-4" />
            Login Karein
          </button>
          <button
            onClick={() => { setTab("register"); setRegisterError(""); setRegisterPin(""); }}
            className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-xl font-semibold text-sm transition-all duration-200 ${
              tab === "register"
                ? "bg-background text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <UserPlus className="w-4 h-4" />
            Register Karein
          </button>
        </div>

        {/* ── LOGIN TAB ── */}
        {tab === "login" && (
          <div className="bg-card border border-border rounded-2xl p-6 shadow-sm">
            <h2 className="font-display text-xl font-bold mb-1">Apna Salon Dhundein</h2>
            <p className="text-muted-foreground text-sm mb-6">
              Salon ka naam ya phone number likhein, phir apna PIN daalen.
            </p>

            {!selectedSalon ? (
              <div className="space-y-4">
                <div className="relative">
                  <Search className="absolute left-3 top-3.5 w-5 h-5 text-muted-foreground" />
                  <Input
                    placeholder="Salon ka naam ya phone number..."
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                    className="pl-10"
                    autoFocus
                  />
                </div>

                {searchQuery.length > 0 && (
                  <div className="border border-border rounded-xl overflow-hidden divide-y divide-border">
                    {filteredSalons.length === 0 ? (
                      <div className="p-4 text-center text-muted-foreground text-sm">
                        Koi salon nahi mila. Pehle register karein.
                      </div>
                    ) : (
                      filteredSalons.map(salon => (
                        <button
                          key={salon.id}
                          onClick={() => { setSelectedSalon({ id: salon.id, name: salon.name }); setSearchQuery(""); }}
                          className="w-full flex items-center justify-between px-4 py-3.5 hover:bg-muted/60 transition-colors text-left group"
                        >
                          <div>
                            <p className="font-semibold text-foreground">{salon.name}</p>
                            <p className="text-xs text-muted-foreground mt-0.5">{salon.address}</p>
                          </div>
                          <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" />
                        </button>
                      ))
                    )}
                  </div>
                )}
              </div>
            ) : (
              <form onSubmit={handleLoginSubmit} className="space-y-5">
                {/* Selected salon display */}
                <div className="flex items-center justify-between p-3.5 bg-primary/5 border border-primary/20 rounded-xl">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 bg-primary/10 rounded-lg flex items-center justify-center">
                      <Store className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <p className="font-semibold text-foreground text-sm">{selectedSalon.name}</p>
                      <p className="text-xs text-muted-foreground">Selected</p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => { setSelectedSalon(null); setLoginPin(""); setLoginError(""); }}
                    className="text-xs text-primary hover:underline"
                  >
                    Badlein
                  </button>
                </div>

                <div>
                  <Label>4-Digit PIN</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-3.5 w-5 h-5 text-muted-foreground" />
                    <Input
                      type={showLoginPin ? "text" : "password"}
                      value={loginPin}
                      onChange={e => {
                        setLoginPin(e.target.value.replace(/\D/g, "").slice(0, 4));
                        setLoginError("");
                      }}
                      placeholder="••••"
                      className="pl-10 pr-10 text-center text-2xl tracking-widest font-bold"
                      maxLength={4}
                      autoFocus
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowLoginPin(v => !v)}
                      className="absolute right-3 top-3.5 text-muted-foreground hover:text-foreground"
                    >
                      {showLoginPin ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                  {loginError && (
                    <p className="text-destructive text-sm mt-2">⚠️ {loginError}</p>
                  )}
                </div>

                <Button
                  type="submit"
                  className="w-full gap-2"
                  disabled={loginPin.length !== 4 || salonLogin.isPending}
                >
                  <LogIn className="w-4 h-4" />
                  {salonLogin.isPending ? "Login ho raha hai..." : "Dashboard Kholein"}
                </Button>
              </form>
            )}
          </div>
        )}

        {/* ── REGISTER TAB ── */}
        {tab === "register" && (
          <div className="bg-card border border-border rounded-2xl p-6 shadow-sm">
            <h2 className="font-display text-xl font-bold mb-1">Naya Salon Register Karein</h2>
            <p className="text-muted-foreground text-sm mb-6">
              Apna salon ka detail bharein aur ek 4-digit PIN set karein.
            </p>

            <form onSubmit={handleRegisterSubmit} className="space-y-4">
              <div>
                <Label>Salon Ka Naam *</Label>
                <Input name="name" placeholder="jaise: Glamour Beauty Studio" required />
              </div>
              <div>
                <Label>Owner Ka Naam *</Label>
                <Input name="ownerName" placeholder="jaise: Priya Sharma" required />
              </div>
              <div>
                <Label>Phone Number *</Label>
                <Input name="phone" type="tel" placeholder="9876543210" required />
              </div>
              <div>
                <Label>Pata (Address) *</Label>
                <Input name="address" placeholder="jaise: Connaught Place, New Delhi" required />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Kholne Ka Waqt *</Label>
                  <Input type="time" name="openTime" defaultValue="09:00" required />
                </div>
                <div>
                  <Label>Band Karne Ka Waqt *</Label>
                  <Input type="time" name="closeTime" defaultValue="20:00" required />
                </div>
              </div>

              <div>
                <Label>Dashboard PIN (4 numbers) *</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3.5 w-5 h-5 text-muted-foreground" />
                  <Input
                    type={showRegisterPin ? "text" : "password"}
                    value={registerPin}
                    onChange={e => {
                      setRegisterPin(e.target.value.replace(/\D/g, "").slice(0, 4));
                      setRegisterError("");
                    }}
                    placeholder="••••"
                    className="pl-10 pr-10 text-center text-2xl tracking-widest font-bold"
                    maxLength={4}
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowRegisterPin(v => !v)}
                    className="absolute right-3 top-3.5 text-muted-foreground hover:text-foreground"
                  >
                    {showRegisterPin ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
                <p className="text-xs text-muted-foreground mt-1.5">
                  ⚠️ Yeh PIN yaad rakhein — isi se aap apna dashboard kholenge.
                </p>
                {registerError && (
                  <p className="text-destructive text-sm mt-1">⚠️ {registerError}</p>
                )}
              </div>

              <Button
                type="submit"
                className="w-full gap-2 mt-2"
                disabled={createSalon.isPending || registerPin.length !== 4}
              >
                <UserPlus className="w-4 h-4" />
                {createSalon.isPending ? "Register ho raha hai..." : "Register Karein & Dashboard Kholein"}
              </Button>
            </form>
          </div>
        )}
      </div>
    </Layout>
  );
}
