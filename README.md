# 🚗 RideJusto

RideJusto é um projeto de backend para um aplicativo de mobilidade urbana, focado em **preço justo**, **transparência** e **melhor experiência** para motoristas e passageiros.

Este repositório contém o **MVP do backend**, desenvolvido com **FastAPI**, seguindo boas práticas de arquitetura e versionamento com Git.

---

## 🧠 Problema que o RideJusto resolve

- Tarifas pouco transparentes
- Motoristas penalizados por cancelamentos injustos
- Falta de previsibilidade no preço final
- Pouco controle para motoristas e passageiros

---

## 💡 Proposta da solução

- Cálculo de preço mais justo
- Estrutura preparada para reputação bidirecional
- Base sólida para regras de cancelamento
- Backend escalável e organizado

---

## 🏗️ Arquitetura do projeto

backend/
├── app/
│ ├── api/
│ │ └── v1/
│ │ ├── auth.py
│ │ ├── rides.py
│ │ └── router.py
│ ├── core/
│ │ ├── config.py
│ │ └── security.py
│ ├── database/
│ │ ├── base.py
│ │ ├── init_db.py
│ │ └── session.py
│ ├── models/
│ │ ├── user.py
│ │ ├── driver.py
│ │ └── ride.py
│ ├── schemas/
│ │ ├── auth.py
│ │ └── ride.py
│ ├── services/
│ │ └── pricing.py
│ └── main.py
│
├── ridejusto.db
└── venv/


---

## 🚀 Como rodar o projeto

### 1️⃣ Ativar o ambiente virtual
```bash
venv\Scripts\activate

2️⃣ Rodar o servidor
uvicorn app.main:app --reload
