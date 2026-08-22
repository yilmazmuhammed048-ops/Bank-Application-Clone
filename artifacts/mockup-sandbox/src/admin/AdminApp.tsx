import { useEffect, useState } from "react";

type TransactionType = "income" | "expense";

type Transaction = {
  id: number;
  title: string;
  description: string;
  amount: string;
  date: string;
  time?: string;
  type: TransactionType;
  recipientName: string;
  recipientIban: string;
  recipientBank?: string;
  transactionNumber: string;
};

type AccountData = {
  name: string;
  iban: string;
  accountNumber: string;
  balance: string;
  cardNumber: string;
  cardLimit: string;
  phone: string;
};

const ADMIN_PASSWORD = "1234";

const defaultAccount: AccountData = {
  name: "Muhammed Yılmaz",
  iban: "TR00 0000 0000 0000 0000 0000 00",
  accountNumber: "00000000",
  balance: "125000",
  cardNumber: "0000 0000 0000 0000",
  cardLimit: "50000",
  phone: "05XX XXX XX XX",
};

const defaultTransactions: Transaction[] = [
  {
    id: 1,
    title: "Market",
    description: "Kart ile ödeme",
    amount: "450,00",
    date: "17 Ağustos 2026",
    time: "14:30",
    type: "expense",
    recipientName: "Fenerbahçe",
    recipientIban: "TR00 0000 0000 0000 0000 0000 00",
    recipientBank: "Banka Bilgisi",
    transactionNumber: "202608170001",
  },
  {
    id: 2,
    title: "Maaş",
    description: "Hesaba gelen ödeme",
    amount: "35.000,00",
    date: "15 Ağustos 2026",
    time: "09:15",
    type: "income",
    recipientName: "Muhammed Yılmaz",
    recipientIban: "TR00 0000 0000 0000 0000 0000 00",
    recipientBank: "Banka Bilgisi",
    transactionNumber: "202608150001",
  },
];

function getSavedAccount(): AccountData {
  try {
    const saved = localStorage.getItem("demo_account");

    if (saved) {
      return {
        ...defaultAccount,
        ...JSON.parse(saved),
      };
    }
  } catch {
    // Varsayılan bilgiler kullanılacak.
  }

  return defaultAccount;
}

function getSavedTransactions(): Transaction[] {
  try {
    const saved = localStorage.getItem("demo_transactions");

    if (saved) {
      const parsed = JSON.parse(saved);

      if (Array.isArray(parsed)) {
        return parsed;
      }
    }
  } catch {
    // Varsayılan işlemler kullanılacak.
  }

  return defaultTransactions;
}

export default function AdminApp() {
  const [loggedIn, setLoggedIn] = useState(
    localStorage.getItem("demo_admin_logged_in") === "true",
  );

  const [password, setPassword] = useState("");
  const [loginError, setLoginError] = useState("");

  const [account, setAccount] = useState<AccountData>(getSavedAccount);

  const [transactions, setTransactions] =
    useState<Transaction[]>(getSavedTransactions);

  const [message, setMessage] = useState("");

  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    if (!message) return;

    const timer = window.setTimeout(() => {
      setMessage("");
    }, 3000);

    return () => window.clearTimeout(timer);
  }, [message]);

  const login = () => {
    if (password === ADMIN_PASSWORD) {
      localStorage.setItem("demo_admin_logged_in", "true");
      setLoggedIn(true);
      setPassword("");
      setLoginError("");
      return;
    }

    setLoginError("Şifre yanlış.");
  };

  const logout = () => {
    localStorage.removeItem("demo_admin_logged_in");
    setLoggedIn(false);
  };

  const updateAccount = (
    field: keyof AccountData,
    value: string,
  ) => {
    setAccount((current) => ({
      ...current,
      [field]: value,
    }));
  };

  const parseAmount = (value: string) => {
    const cleaned = String(value)
      .replace(/TL/gi, "")
      .replace(/\s/g, "")
      .replace(/\./g, "")
      .replace(",", ".")
      .replace(/[^0-9.-]/g, "");

    const number = Number(cleaned);
    return Number.isFinite(number) ? number : 0;
  };

  const formatBalance = (value: number) => {
    return value.toFixed(2).replace(".", ",");
  };

  const transactionEffect = (transaction: Transaction) => {
    const amount = parseAmount(transaction.amount);
    return transaction.type === "income" ? amount : -amount;
  };

const addTransaction = () => {
  const newTransaction: Transaction = {
    id: Date.now(),
    title: "Yeni İşlem",
    description: "İşlem açıklaması",
    amount: "100,00",
    date: "17 Ağustos 2026",
    time: "12:00",
    type: "expense",
    recipientName: "Fenerbahçe",
    recipientIban: "TR00 0000 0000 0000 0000 0000 00",
    recipientBank: "Banka Bilgisi",
    transactionNumber: "202608170001",
  };
  setTransactions((current) => [
    newTransaction,
    ...current,
  ]);

  setAccount((currentAccount) => ({
    ...currentAccount,
    balance: formatBalance(
      parseAmount(currentAccount.balance) +
        transactionEffect(newTransaction),
    ),
  }));
};

  const updateTransaction = (
    id: number,
    field: keyof Transaction,
    value: string,
  ) => {
    setTransactions((current) => {
      const oldTransaction = current.find((item) => item.id === id);
      if (!oldTransaction) return current;

      const updatedTransaction = {
        ...oldTransaction,
        [field]: field === "type" ? (value as TransactionType) : value,
      };

      const balanceChange =
        transactionEffect(updatedTransaction) -
        transactionEffect(oldTransaction);

      if (balanceChange !== 0) {
        setAccount((currentAccount) => ({
          ...currentAccount,
          balance: formatBalance(
            parseAmount(currentAccount.balance) + balanceChange,
          ),
        }));
      }

      return current.map((item) =>
        item.id === id ? updatedTransaction : item,
      );
    });
  };

  const deleteTransaction = (id: number) => {
    setTransactions((current) => {
      const transaction = current.find((item) => item.id === id);

      if (transaction) {
        setAccount((currentAccount) => ({
          ...currentAccount,
          balance: formatBalance(
            parseAmount(currentAccount.balance) -
              transactionEffect(transaction),
          ),
        }));
      }

      return current.filter((item) => item.id !== id);
    });
  };

  const saveAll = async () => {
    localStorage.setItem(
      "demo_account",
      JSON.stringify(account),
    );

    localStorage.setItem(
      "demo_balance",
      account.balance,
    );

    localStorage.setItem(
      "demo_transactions",
      JSON.stringify(transactions),
    );

    setMessage("Kaydediliyor...");

    try {
      const response = await fetch("/api/state", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          account,
          transactions,
        }),
      });

      if (!response.ok) {
        throw new Error("Kaydetme isteği başarısız oldu.");
      }

      setMessage("Değişiklikler uygulamaya gönderildi.");
    } catch {
      setMessage("Kaydetme başarısız oldu. Tekrar deneyin.");
    }
  };

  const resetData = () => {
    const confirmed = window.confirm(
      "Tüm demo bilgileri varsayılan değerlere döndürülsün mü?",
    );

    if (!confirmed) return;

    setAccount(defaultAccount);
    setTransactions(defaultTransactions);

    localStorage.setItem(
      "demo_account",
      JSON.stringify(defaultAccount),
    );

    localStorage.setItem(
      "demo_balance",
      defaultAccount.balance,
    );

    localStorage.setItem(
      "demo_transactions",
      JSON.stringify(defaultTransactions),
    );

    setMessage("Demo bilgiler sıfırlandı.");
  };

  if (!loggedIn) {
    return (
      <div style={styles.loginPage}>
        <div style={styles.loginCard}>
          <div style={styles.logoCircle}>Y</div>

          <h1 style={styles.loginTitle}>
            Yönetim Paneli
          </h1>

          <p style={styles.loginDescription}>
            Demo hesabını yönetmek için giriş yapın.
          </p>

          <label style={styles.label}>
            Yönetici Şifresi
          </label>

          <div style={styles.passwordWrapper}>
            <input
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(event) =>
                setPassword(event.target.value)
              }
              onKeyDown={(event) => {
                if (event.key === "Enter") {
                  login();
                }
              }}
              placeholder="Şifre"
              style={styles.loginInput}
            />

            <button
              type="button"
              onClick={() =>
                setShowPassword((current) => !current)
              }
              style={styles.eyeButton}
            >
              {showPassword ? "Gizle" : "Göster"}
            </button>
          </div>

          {loginError && (
            <div style={styles.errorBox}>
              {loginError}
            </div>
          )}

          <button
            onClick={login}
            style={styles.loginButton}
          >
            Yönetim Paneline Gir
          </button>

          <p style={styles.demoPassword}>
            Demo şifre: <strong>1234</strong>
          </p>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.page}>
      <header style={styles.header}>
        <div>
          <div style={styles.headerTitle}>
            Yönetim Paneli
          </div>

          <div style={styles.headerSubtitle}>
            Demo hesap yönetimi
          </div>
        </div>

        <button
          onClick={logout}
          style={styles.logoutButton}
        >
          Çıkış Yap
        </button>
      </header>

      <main style={styles.container}>
        {message && (
          <div style={styles.successBox}>
            ✓ {message}
          </div>
        )}

        <section style={styles.summaryCard}>
          <div>
            <div style={styles.smallText}>
              Mevcut Bakiye
            </div>

            <div style={styles.balance}>
              {account.balance || "0"} TL
            </div>

            <div style={styles.accountName}>
              {account.name}
            </div>
          </div>

          <div style={styles.summaryIcon}>
            ₺
          </div>
        </section>

        <section style={styles.card}>
          <div style={styles.sectionHeader}>
            <div>
              <h2 style={styles.sectionTitle}>
                Hesap Bilgileri
              </h2>

              <p style={styles.sectionDescription}>
                Ana demo hesabının bilgilerini düzenleyin.
              </p>
            </div>
          </div>

          <div style={styles.grid}>
            <div>
              <label style={styles.label}>
                Ad Soyad
              </label>

              <input
                value={account.name}
                onChange={(event) =>
                  updateAccount("name", event.target.value)
                }
                style={styles.input}
              />
            </div>

            <div>
              <label style={styles.label}>
                Telefon
              </label>

              <input
                value={account.phone}
                onChange={(event) =>
                  updateAccount("phone", event.target.value)
                }
                style={styles.input}
              />
            </div>

            <div>
              <label style={styles.label}>
                Bakiye
              </label>

            <input
  type="text"
  value={account.balance}
  onChange={(event) =>
    updateAccount("balance", event.target.value)
  }
  placeholder="Örn: 125000"
  style={{
    ...styles.input,
    border: "2px solid #d71920",
    backgroundColor: "#fff",
    fontSize: "18px",
    fontWeight: "600",
    color: "#222",
    cursor: "text",
  }}
  inputMode="decimal"
/>
            </div>

            <div>
              <label style={styles.label}>
                Hesap Numarası
              </label>

              <input
                value={account.accountNumber}
                onChange={(event) =>
                  updateAccount(
                    "accountNumber",
                    event.target.value,
                  )
                }
                style={styles.input}
              />
            </div>

            <div style={styles.fullWidth}>
              <label style={styles.label}>
                IBAN
              </label>

              <input
                value={account.iban}
                onChange={(event) =>
                  updateAccount(
                    "iban",
                    event.target.value,
                  )
                }
                style={styles.input}
              />
            </div>
          </div>
        </section>

        <section style={styles.card}>
          <div style={styles.sectionHeader}>
            <div>
              <h2 style={styles.sectionTitle}>
                Kart Bilgileri
              </h2>

              <p style={styles.sectionDescription}>
                Demo kart bilgilerinin görünümünü düzenleyin.
              </p>
            </div>
          </div>

          <div style={styles.grid}>
            <div>
              <label style={styles.label}>
                Kart Numarası
              </label>

              <input
                value={account.cardNumber}
                onChange={(event) =>
                  updateAccount(
                    "cardNumber",
                    event.target.value,
                  )
                }
                style={styles.input}
              />
            </div>

            <div>
              <label style={styles.label}>
                Kart Limiti
              </label>

              <input
                value={account.cardLimit}
                onChange={(event) =>
                  updateAccount(
                    "cardLimit",
                    event.target.value,
                  )
                }
                style={styles.input}
              />
            </div>
          </div>
        </section>

        <section style={styles.card}>
          <div style={styles.sectionHeader}>
            <div>
              <h2 style={styles.sectionTitle}>
                Hesap Hareketleri
              </h2>

              <p style={styles.sectionDescription}>
                Ana uygulamada gösterilecek işlemleri
                yönetin.
              </p>
            </div>

            <button
              onClick={addTransaction}
              style={styles.addButton}
            >
              + İşlem Ekle
            </button>
          </div>

          {transactions.length === 0 && (
            <div style={styles.empty}>
              Henüz hesap hareketi bulunmuyor.
            </div>
          )}

          {transactions.map((item, index) => (
            <div
              key={item.id}
              style={styles.transactionCard}
            >
              <div style={styles.transactionTop}>
                <div style={styles.transactionNumber}>
                  #{transactions.length - index}
                </div>

                <button
                  onClick={() =>
                    deleteTransaction(item.id)
                  }
                  style={styles.deleteButton}
                >
                  Sil
                </button>
              </div>

              <div style={styles.grid}>
                <div>
                  <label style={styles.label}>
                    İşlem Adı
                  </label>

                  <input
                    value={item.title}
                    onChange={(event) =>
                      updateTransaction(
                        item.id,
                        "title",
                        event.target.value,
                      )
                    }
                    style={styles.input}
                  />
                </div>

                <div>
                  <label style={styles.label}>
                    Açıklama
                  </label>

                  <input
                    value={item.description}
                    onChange={(event) =>
                      updateTransaction(
                        item.id,
                        "description",
                        event.target.value,
                      )
                    }
                    style={styles.input}
                  />
                </div>

                <div>
                  <label style={styles.label}>
                    Tutar
                  </label>

                  <input
                    value={item.amount}
                    onChange={(event) =>
                      updateTransaction(
                        item.id,
                        "amount",
                        event.target.value,
                      )
                    }
                    style={styles.input}
                  />
                </div>

                <div>
                  <label style={styles.label}>
                    İşlem Türü
                  </label>

                  <select
                    value={item.type}
                    onChange={(event) =>
                      updateTransaction(
                        item.id,
                        "type",
                        event.target.value,
                      )
                    }
                    style={styles.input}
                  >
                    <option value="expense">
                      Giden ödeme
                    </option>

                    <option value="income">
                      Gelen ödeme
                    </option>
                  </select>
                </div>

                <div>
                  <label style={styles.label}>Alıcı / Gönderen</label>
                  <input
                    value={item.recipientName}
                    onChange={(event) =>
                      updateTransaction(item.id, "recipientName", event.target.value)
                    }
                    style={styles.input}
                  />
                </div>

                <div>
                  <label style={styles.label}>Alıcı / Gönderen IBAN</label>
                  <input
                    value={item.recipientIban}
                    onChange={(event) =>
                      updateTransaction(item.id, "recipientIban", event.target.value)
                    }
                    style={styles.input}
                  />
                </div>

                <div>
                  <label style={styles.label}>Alan Banka (Dekont)</label>
                  <input
                    value={item.recipientBank ?? ""}
                    onChange={(event) =>
                      updateTransaction(item.id, "recipientBank", event.target.value)
                    }
                    placeholder="Örn: Türkiye İş Bankası A.Ş."
                    style={styles.input}
                  />
                </div>

                <div>
                  <label style={styles.label}>İşlem Numarası</label>
                  <input
                    value={item.transactionNumber}
                    onChange={(event) =>
                      updateTransaction(item.id, "transactionNumber", event.target.value)
                    }
                    style={styles.input}
                  />
                </div>

                <div>
                  <label style={styles.label}>
                    Tarih
                  </label>

                  <input
                    value={item.date}
                    onChange={(event) =>
                      updateTransaction(
                        item.id,
                        "date",
                        event.target.value,
                      )
                    }
                    style={styles.input}
                  />
                </div>

                <div>
                  <label style={styles.label}>İşlem Saati</label>
                  <input
                    type="time"
                    value={item.time ?? ""}
                    onChange={(event) =>
                      updateTransaction(item.id, "time", event.target.value)
                    }
                    style={styles.input}
                  />
                </div>
              </div>

              <div
                style={{
                  ...styles.typeBadge,
                  ...(item.type === "income"
                    ? styles.incomeBadge
                    : styles.expenseBadge),
                }}
              >
                {item.type === "income"
                  ? "GELEN ÖDEME"
                  : "GİDEN ÖDEME"}
              </div>
            </div>
          ))}
        </section>

        <div style={styles.bottomActions}>
          <button
            onClick={resetData}
            style={styles.resetButton}
          >
            Varsayılanlara Dön
          </button>

          <button
            onClick={saveAll}
            style={styles.saveButton}
          >
            Değişiklikleri Kaydet
          </button>
        </div>
      </main>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  page: {
    minHeight: "100vh",
    background: "#f3f5f7",
    fontFamily:
      "Inter, Arial, Helvetica, sans-serif",
    color: "#17211b",
    paddingBottom: "60px",
  },

  header: {
    background: "#006b3f",
    color: "#fff",
    padding: "22px 32px",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    boxShadow:
      "0 2px 10px rgba(0,0,0,0.12)",
  },

  headerTitle: {
    fontSize: "23px",
    fontWeight: 700,
  },

  headerSubtitle: {
    marginTop: "4px",
    fontSize: "13px",
    opacity: 0.82,
  },

  logoutButton: {
    border: "1px solid rgba(255,255,255,0.45)",
    background: "transparent",
    color: "#fff",
    borderRadius: "9px",
    padding: "10px 15px",
    cursor: "pointer",
    fontWeight: 600,
  },

  container: {
    width: "min(100% - 32px, 980px)",
    margin: "28px auto",
  },

  successBox: {
    background: "#e8f7ef",
    border: "1px solid #b8e5ca",
    color: "#006b3f",
    padding: "14px 16px",
    borderRadius: "12px",
    marginBottom: "18px",
    fontWeight: 600,
  },

  summaryCard: {
    background: "#006b3f",
    color: "#fff",
    borderRadius: "18px",
    padding: "28px",
    marginBottom: "20px",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    boxShadow:
      "0 8px 25px rgba(0,107,63,0.16)",
  },

  smallText: {
    fontSize: "13px",
    opacity: 0.8,
    marginBottom: "8px",
  },

  balance: {
    fontSize: "34px",
    fontWeight: 800,
    letterSpacing: "-0.5px",
  },

  accountName: {
    marginTop: "8px",
    fontSize: "14px",
    opacity: 0.85,
  },

  summaryIcon: {
    width: "58px",
    height: "58px",
    borderRadius: "50%",
    background: "rgba(255,255,255,0.14)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "25px",
    fontWeight: 800,
  },

  card: {
    background: "#fff",
    borderRadius: "18px",
    padding: "25px",
    marginBottom: "20px",
    boxShadow:
      "0 2px 12px rgba(0,0,0,0.045)",
  },

  sectionHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: "20px",
    marginBottom: "20px",
  },

  sectionTitle: {
    margin: 0,
    fontSize: "20px",
  },

  sectionDescription: {
    margin: "6px 0 0",
    color: "#747b78",
    fontSize: "13px",
  },

  grid: {
    display: "grid",
    gridTemplateColumns:
      "repeat(auto-fit, minmax(240px, 1fr))",
    gap: "15px",
  },

  fullWidth: {
    gridColumn: "1 / -1",
  },

  label: {
    display: "block",
    fontSize: "13px",
    fontWeight: 600,
    marginBottom: "7px",
    color: "#4e5752",
  },

  input: {
    width: "100%",
    boxSizing: "border-box",
    padding: "12px 13px",
    borderRadius: "9px",
    border: "1px solid #d9dedb",
    outline: "none",
    fontSize: "15px",
    background: "#fff",
    color: "#17211b",
  },

  addButton: {
    background: "#006b3f",
    color: "#fff",
    border: 0,
    borderRadius: "9px",
    padding: "11px 15px",
    cursor: "pointer",
    fontWeight: 600,
    whiteSpace: "nowrap",
  },

  transactionCard: {
    position: "relative",
    border: "1px solid #e1e5e2",
    borderRadius: "14px",
    padding: "18px",
    marginTop: "14px",
    background: "#fbfcfb",
  },

  transactionTop: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: "15px",
  },

  transactionNumber: {
    fontSize: "13px",
    fontWeight: 700,
    color: "#006b3f",
  },

  deleteButton: {
    border: 0,
    background: "#fff0f0",
    color: "#c0392b",
    borderRadius: "8px",
    padding: "8px 12px",
    cursor: "pointer",
    fontWeight: 600,
  },

  typeBadge: {
    display: "inline-block",
    marginTop: "14px",
    borderRadius: "20px",
    padding: "6px 10px",
    fontSize: "10px",
    fontWeight: 800,
    letterSpacing: "0.4px",
  },

  incomeBadge: {
    background: "#e7f7ed",
    color: "#08763f",
  },

  expenseBadge: {
    background: "#fff0ef",
    color: "#b62f27",
  },

  empty: {
    textAlign: "center",
    padding: "35px 10px",
    color: "#777",
  },

  bottomActions: {
    display: "flex",
    gap: "12px",
    justifyContent: "flex-end",
    alignItems: "center",
  },

  resetButton: {
    background: "#fff",
    color: "#555",
    border: "1px solid #d9dedb",
    borderRadius: "10px",
    padding: "14px 18px",
    cursor: "pointer",
    fontWeight: 600,
  },

  saveButton: {
    background: "#006b3f",
    color: "#fff",
    border: 0,
    borderRadius: "10px",
    padding: "14px 24px",
    cursor: "pointer",
    fontSize: "15px",
    fontWeight: 700,
  },

  loginPage: {
    minHeight: "100vh",
    background: "#f3f5f7",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "20px",
    fontFamily:
      "Inter, Arial, Helvetica, sans-serif",
  },

  loginCard: {
    width: "100%",
    maxWidth: "390px",
    background: "#fff",
    borderRadius: "20px",
    padding: "35px",
    boxSizing: "border-box",
    boxShadow:
      "0 12px 40px rgba(0,0,0,0.08)",
  },

  logoCircle: {
    width: "58px",
    height: "58px",
    borderRadius: "50%",
    background: "#006b3f",
    color: "#fff",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "25px",
    fontWeight: 800,
    marginBottom: "22px",
  },

  loginTitle: {
    margin: 0,
    fontSize: "25px",
  },

  loginDescription: {
    color: "#777",
    fontSize: "14px",
    lineHeight: 1.5,
    margin: "9px 0 25px",
  },

  loginInput: {
    width: "100%",
    boxSizing: "border-box",
    padding: "13px",
    paddingRight: "75px",
    borderRadius: "10px",
    border: "1px solid #d9dedb",
    fontSize: "16px",
    outline: "none",
  },

  passwordWrapper: {
    position: "relative",
    marginBottom: "12px",
  },

  eyeButton: {
    position: "absolute",
    right: "8px",
    top: "7px",
    height: "34px",
    border: 0,
    background: "#f1f3f2",
    borderRadius: "7px",
    padding: "0 9px",
    cursor: "pointer",
    color: "#4b544f",
    fontSize: "12px",
  },

  errorBox: {
    background: "#fff0ef",
    color: "#b62f27",
    borderRadius: "8px",
    padding: "10px 12px",
    fontSize: "13px",
    marginBottom: "12px",
  },

  loginButton: {
    width: "100%",
    background: "#006b3f",
    color: "#fff",
    border: 0,
    borderRadius: "10px",
    padding: "14px",
    cursor: "pointer",
    fontSize: "15px",
    fontWeight: 700,
  },

  demoPassword: {
    textAlign: "center",
    color: "#999",
    fontSize: "12px",
    marginTop: "18px",
  },
};