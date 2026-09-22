const API_URL = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000/api';
async function request(path, options={}){
  const headers={...(options.headers||{})}; const token=localStorage.getItem('agri_token');
  if(token) headers.Authorization=`Token ${token}`;
  const config={...options,headers};
  if(config.body && !(config.body instanceof FormData)){headers['Content-Type']='application/json';config.body=JSON.stringify(config.body);}
  const response=await fetch(`${API_URL}${path}`,config); const text=await response.text(); let data=null;
  try{data=text?JSON.parse(text):null}catch{data={detail:text};}
  if(!response.ok) throw new Error(data?.detail || Object.values(data||{}).flat().join(' ') || 'Une erreur est survenue.');
  return data;
}
export const api={
  me:()=>request('/auth/me/'),
  login:async(body)=>{const d=await request('/auth/login/',{method:'POST',body});localStorage.setItem('agri_token',d.token);return d;},
  register:async(body)=>{const d=await request('/auth/register/',{method:'POST',body});localStorage.setItem('agri_token',d.token);return d;},
  logout:async()=>{try{return await request('/auth/logout/',{method:'POST'});}finally{localStorage.removeItem('agri_token');}},
  cultures:()=>request('/mes-cultures/'), cultureRefs:()=>request('/cultures/'), regions:()=>request('/regions/'),
  departments:(region)=>request(`/departements/?region=${region}`), communes:(department)=>request(`/communes/?departement=${department}`),
  createCulture:(body)=>request('/mes-cultures/',{method:'POST',body}), updateCulture:(id,body)=>request(`/mes-cultures/${id}/`,{method:'PATCH',body}),
  deleteCulture:(id)=>request(`/mes-cultures/${id}/`,{method:'DELETE'}), calendar:(id)=>request(`/calendriers/${id}/`),
  hydrique:(id)=>request(`/hydrique/${id}/`), weather:(id)=>request(`/meteo/${id}/`), analyze:(formData)=>request('/ia/analyse/',{method:'POST',body:formData}),
  adminFarmers: () =>
  request("/admin/agriculteurs/"),

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
  request(`/admin/agriculteurs/${id}/cultures/`, {
    method: "POST",
    body,
  }),

updateProfile: (body) =>
  request("/auth/profile/", {
    method: "PATCH",
    body,
  }),

getProfile: () =>
  request("/auth/profile/"),
};



