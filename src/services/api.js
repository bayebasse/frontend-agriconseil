// const API_URL = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000/api';
// async function request(path, options={}){
//   const headers={...(options.headers||{})}; const token=localStorage.getItem('agri_token');
//   if(token) headers.Authorization=`Token ${token}`;
//   const config={...options,headers};
//   if(config.body && !(config.body instanceof FormData)){headers['Content-Type']='application/json';config.body=JSON.stringify(config.body);}
//   const response=await fetch(`${API_URL}${path}`,config); const text=await response.text(); let data=null;
//   try{data=text?JSON.parse(text):null}catch{data={detail:text};}
//   if(!response.ok) throw new Error(data?.detail || Object.values(data||{}).flat().join(' ') || 'Une erreur est survenue.');
//   return data;
// }
// export const api={
//   me:()=>request('/auth/me/'),
//   login:async(body)=>{const d=await request('/auth/login/',{method:'POST',body});localStorage.setItem('agri_token',d.token);return d;},
//   register:async(body)=>{const d=await request('/auth/register/',{method:'POST',body});localStorage.setItem('agri_token',d.token);return d;},
//   logout:async()=>{try{return await request('/auth/logout/',{method:'POST'});}finally{localStorage.removeItem('agri_token');}},
//   cultures:()=>request('/mes-cultures/'), cultureRefs:()=>request('/cultures/'), regions:()=>request('/regions/'),
//   departments:(region)=>request(`/departements/?region=${region}`), communes:(department)=>request(`/communes/?departement=${department}`),
//   createCulture:(body)=>request('/mes-cultures/',{method:'POST',body}), updateCulture:(id,body)=>request(`/mes-cultures/${id}/`,{method:'PATCH',body}),
//   deleteCulture:(id)=>request(`/mes-cultures/${id}/`,{method:'DELETE'}), calendar:(id)=>request(`/calendriers/${id}/`),
//   hydrique:(id)=>request(`/hydrique/${id}/`), weather:(id)=>request(`/meteo/${id}/`), analyze:(formData)=>request('/ia/analyse/',{method:'POST',body:formData}),
//   adminFarmers: () =>
//   request("/admin/agriculteurs/"),

// adminCreateFarmer: (body) =>
//   request("/admin/agriculteurs/", {
//     method: "POST",
//     body,
//   }),

// adminUpdateFarmer: (id, body) =>
//   request(`/admin/agriculteurs/${id}/`, {
//     method: "PATCH",
//     body,
//   }),

// adminDeleteFarmer: (id) =>
//   request(`/admin/agriculteurs/${id}/`, {
//     method: "DELETE",
//   }),

// adminAddFarmerCulture: (id, body) =>
//   request(`/admin/agriculteurs/${id}/cultures/`, {
//     method: "POST",
//     body,
//   }),

// updateProfile: (body) =>
//   request("/auth/profile/", {
//     method: "PATCH",
//     body,
//   }),

// getProfile: () =>
//   request("/auth/profile/"),
// };

//versiion Finale bug

// 


//versiion finale sans bugggg

const configuredApiUrl = import.meta.env.VITE_API_URL?.trim();
const API_URL = (
  configuredApiUrl ||
  (import.meta.env.DEV ? "http://127.0.0.1:8000/api" : "")
).replace(/\/+$/, "");

async function request(path, options = {}) {
  if (!API_URL) {
    throw new Error(
      "L’URL de l’API est absente. Configurez VITE_API_URL avant de lancer ou construire l’application."
    );
  }

  const headers = {
    ...(options.headers || {}),
  };

  const token = localStorage.getItem("agri_token");

  if (token) {
    headers.Authorization = `Token ${token}`;
  }

  const config = {
    ...options,
    headers,
  };

  // Pour FormData, ne pas définir Content-Type manuellement.
  // Le navigateur ajoute automatiquement le multipart/form-data
  // avec la bonne boundary.
  if (
    config.body &&
    !(config.body instanceof FormData)
  ) {
    headers["Content-Type"] = "application/json";
    config.body = JSON.stringify(config.body);
  }

  const response = await fetch(
    `${API_URL}${path}`,
    config
  );

  const text = await response.text();

  let data = null;

  try {
    data = text ? JSON.parse(text) : null;
  } catch {
    data = {
      detail: text,
    };
  }

  if (!response.ok) {
    const fieldErrors = Object.entries(data || {})
      .filter(([key]) => key !== "detail")
      .map(([key, value]) => `${key}: ${Array.isArray(value) ? value.join(" ") : value}`)
      .filter((message) => message && !message.endsWith(": "));
    throw new Error(
      data?.detail ||
        fieldErrors.join(" ") ||
        "Une erreur est survenue."
    );
  }

  return data;
}

export const api = {
  me: () =>
    request("/auth/me/"),

  login: async (body) => {
    const identifier = (body.username || body.email || "").trim();
    const credentials = identifier.includes("@")
      ? { email: identifier, password: body.password }
      : { username: identifier, password: body.password };

    const d = await request(
      "/auth/login/",
      {
        method: "POST",
        body: credentials,
      }
    );

    localStorage.setItem(
      "agri_token",
      d.token
    );

    return d;
  },

  register: async (body) => {
    return request(
      "/auth/register/",
      {
        method: "POST",
        body,
      }
    );
  },

  logout: async () => {
    try {
      return await request(
        "/auth/logout/",
        {
          method: "POST",
        }
      );
    } finally {
      localStorage.removeItem(
        "agri_token"
      );
    }
  },

  cultures: () =>
    request("/mes-cultures/"),

  cultureRefs: () =>
    request("/cultures/"),

  regions: () =>
    request("/regions/"),

  departments: (region) =>
    request(
      `/departements/?region=${region}`
    ),

  communes: (department) =>
    request(
      `/communes/?departement=${department}`
    ),

  createCulture: (body) =>
    request("/mes-cultures/", {
      method: "POST",
      body,
    }),

  yieldPrediction: (id) =>
    request(`/mes-cultures/${id}/prevision-rendement/`),

  buyerCrops: (filters = {}) => {
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== "" && value != null) params.set(key, value);
    });
    return request(`/acheteur/cultures/?${params.toString()}`);
  },

  orders: () => request("/transactions/orders/"),
  createOrder: (cropId, body) => request(`/transactions/crops/${cropId}/orders/`, { method: "POST", body }),
  orderAction: (orderId, action) => request(`/transactions/orders/${orderId}/action/`, { method: "POST", body: { action } }),
  reservations: () => request("/transactions/reservations/"),
  createReservation: (cropId, body) => request(`/transactions/crops/${cropId}/reservations/`, { method: "POST", body }),
  reservationAction: (reservationId, action) => request(`/transactions/reservations/${reservationId}/action/`, { method: "POST", body: { action } }),

  startBuyerConversation: (cropId) =>
    request(`/messages/conversations/from-crop/${cropId}/`, { method: "POST", body: {} }),
  conversations: () => request("/messages/conversations/"),
  conversationMessages: (conversationId) =>
    request(`/messages/conversations/${conversationId}/messages/`),
  sendConversationMessage: (conversationId, body) =>
    request(`/messages/conversations/${conversationId}/messages/`, { method: "POST", body }),
  messageAudio: async (messageId) => {
    const token = localStorage.getItem("agri_token");
    const response = await fetch(`${API_URL}/messages/${messageId}/audio/`, {
      headers: token ? { Authorization: `Token ${token}` } : {},
    });
    if (!response.ok) throw new Error("Impossible de lire ce message vocal.");
    return response.blob();
  },

  updateCulture: (id, body) =>
    request(`/mes-cultures/${id}/`, {
      method: "PATCH",
      body,
    }),

  deleteCulture: (id) =>
    request(`/mes-cultures/${id}/`, {
      method: "DELETE",
    }),

  calendar: (id) =>
    request(`/calendriers/${id}/`),

  hydrique: (id) =>
    request(`/hydrique/${id}/`),

  weather: (id) =>
    request(`/meteo/${id}/`),

  // IA : envoie une image au backend Django
  analyze: (formData) =>
    request("/ia/analyse/", {
      method: "POST",
      body: formData,
    }),

  agriculturalChat: (body) =>
    request("/ia/chat/", { method: "POST", body }),

  chatbot: (body) =>
    request("/chatbot/", { method: "POST", body }),

  adminFarmers: () =>
    request("/admin/agriculteurs/"),

  adminBuyers: () =>
    request("/admin/acheteurs/"),

  adminTrackedCalendars: () =>
    request("/admin/calendriers/"),

  adminTransactions: () =>
    request("/admin/transactions/"),

  adminCreateFarmer: (body) =>
    request("/admin/agriculteurs/", {
      method: "POST",
      body,
    }),

  adminUpdateFarmer: (id, body) =>
    request(`/admin/agriculteurs/${id}/`, {
      method: "PATCH",
      body,
    }),

  adminDeleteFarmer: (id) =>
    request(`/admin/agriculteurs/${id}/`, {
      method: "DELETE",
    }),

  adminAddFarmerCulture: (id, body) =>
    request(
      `/admin/agriculteurs/${id}/cultures/`,
      {
        method: "POST",
        body,
      }
    ),

  updateProfile: (body) =>
    request("/auth/profile/", {
      method: "PATCH",
      body,
    }),

  getProfile: () =>
    request("/auth/profile/"),

  deleteAccount: () =>
    request("/auth/profile/", {
      method: "DELETE",
    }),
};


