import { APIRequestContext, expect } from '@playwright/test';

export interface Usuario {
  _id: string;
  nome: string;
  email: string;
  password: string;
  administrador: boolean;
}

/** E-mail único por execução: evita o erro "Este email já está sendo usado". */
export function emailUnico(prefixo = 'qa'): string {
  return `${prefixo}.${Date.now()}.${Math.floor(Math.random() * 1e6)}@teste.com`;
}

export async function criarUsuario(
  request: APIRequestContext,
  { administrador = false }: { administrador?: boolean } = {},
): Promise<Usuario> {
  const dados = {
    nome: 'Usuário de Teste',
    email: emailUnico(),
    password: 'Senha@123',
    administrador: String(administrador),
  };
  const res = await request.post('/usuarios', { data: dados });
  expect(res.status(), 'cadastro de usuário na preparação do teste').toBe(201);
  const { _id } = await res.json();
  return { ...dados, _id, administrador };
}

export async function login(request: APIRequestContext, usuario: Usuario): Promise<string> {
  const res = await request.post('/login', {
    data: { email: usuario.email, password: usuario.password },
  });
  expect(res.status(), 'login na preparação do teste').toBe(200);
  return (await res.json()).authorization as string;
}

export async function criarProduto(request: APIRequestContext, token: string, nome?: string) {
  const dados = {
    nome: nome ?? `Produto ${Date.now()}-${Math.floor(Math.random() * 1e6)}`,
    preco: 150,
    descricao: 'Produto criado por teste automatizado',
    quantidade: 10,
  };
  const res = await request.post('/produtos', { data: dados, headers: { Authorization: token } });
  expect(res.status(), 'cadastro de produto na preparação do teste').toBe(201);
  const { _id } = await res.json();
  return { ...dados, _id };
}

/** Limpeza "best effort": não falha o teste se o registro já foi removido. */
export async function excluir(
  request: APIRequestContext,
  recurso: 'usuarios' | 'produtos',
  id: string,
  token?: string,
) {
  await request.delete(`/${recurso}/${id}`, token ? { headers: { Authorization: token } } : {});
}
