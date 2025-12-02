#Por hora, os valores das conexões serão armazenados em Dicionários, mas futuramente será em Redis NoSQL
#sid - Session ID - A conexão
user_sids = {}  #conexões que o user tem
sid_user = {}   #a qual user a conexão pertence

def add_sid_for_user(user_id, sid):
    s = user_sids.setdefault(str(user_id), set())
    s.add(sid)
    sid_user[sid] = user_id

def remove_sid(sid):
    #Remove relação sid com usuário
    user_id = sid_user.pop(sid, None)
    if not user_id:
        return None
    
    s = user_sids.get(user_id)
    #Remove o sid, a conexão do usuário
    if s:
        s.discard(sid)

        #Remove o user_id do Dicionário se não tiver mais sids
        if not s:
            user_sids.pop(user_id, None)

    return user_id



