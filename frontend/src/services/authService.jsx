import api from '../api/api';

function extractMessageFromAxiosError(err) {
  if (!err) return 'Erro desconhecido.';
  if (err.message && typeof err.message === 'string' && !err.response) {
    return err.message;
  }
  
  const data = err.response?.data;
  
  return data?.message
  || data?.mensagem
  || data?.erro
  || data?.error
  || data?.msg
  || (typeof data === 'string' ? data : null)
  || err.message
  || 'Erro no servidor';
}

// Serviços relacionados à autenticação
export async function checkEmail(email){
    const { data } = await api.get('/auth/check-email', {
        params: { email }
    });
    return data.exists;
}

export async function checkUsername(username){
    const { data } = await api.get('/auth/check-username', {
        params: { username }
    });
    return data.exists;
}

export async function register(dados){
  try{
    const res = await api.post('/auth/register', dados);
    return res.data;
  }catch (err) {
    const msg = extractMessageFromAxiosError(err);
    throw new Error(msg);
  }
}

export async function  confirmEmail(token){
  try{
    const res = await api.post('/auth/confirm-email', {token:token});
    return res.data;
  }catch (err) {
      const msg = extractMessageFromAxiosError(err);
      throw new Error(msg);
  }
}

export async function  resendEmail(email){
  try{
    const res = await api.post('/auth/resend-confirmation', {email:email});
    return res.data;
  }catch (err) {
      const msg = extractMessageFromAxiosError(err);
      throw new Error(msg);
  }
}

export async function login(email, senha){
  try{
    const res = await api.post('/auth/login', { email, senha });
    
    const access_token = res.data?.access_token;
    const user_id = res.data?.user_id;

    return { access_token, user_id, raw: res.data };
  }catch (err) {
    const msg = extractMessageFromAxiosError(err);

    //Mensagem de email não confirmado, a partir desse erro surge o botão de reenvio.
    const error_code = err.response?.data?.error_code;
    if (error_code){
      throw { message: msg, error_code:error_code, originalError: err };
    }

    throw new Error(msg);
  }
}

export async function logout(){
  try{
    const res = await api.post('/auth/logout');
    return res.data;
  }catch (err) {
    const msg = extractMessageFromAxiosError(err);
    throw new Error(msg);
  }
}

export async function forgotPassword(email) {
  try{
      const res = await api.post('/auth/forgot-password', { email });
      return res.data;
  }catch (err) {
      const msg = extractMessageFromAxiosError(err);
      throw new Error(msg);
  }
}

export async function resetPassword(token, newPassword){
  try{
      // Enviamos o token e a senha no corpo da requisição
      const res = await api.post('/auth/reset-password', { 
          token: token, 
          new_password: newPassword 
      });
      return res.data;
  }catch (err) {
      const msg = extractMessageFromAxiosError(err);
      throw new Error(msg);
  }
}

export async function getMe(){
  try{
    const res = await api.get('/dashboard/me');
    return res.data; // retorne user_details e user_id
  }catch (err) {
    const msg = extractMessageFromAxiosError(err);
    throw new Error(msg);
  }
}