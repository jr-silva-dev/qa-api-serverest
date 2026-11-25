import { test, expect } from '@playwright/test';
import { criarUsuario, emailUnico, excluir } from '../support/api';

test.describe('Usuários', () => {
  test('cadastra um usuário com dados válidos', async ({ request }) => {
    const res = await request.post('/usuarios', {
      data: { nome: 'Ana QA', email: emailUnico(), password: 'Senha@123', administrador: 'false' },
    });

    expect(res.status()).toBe(201);
    const corpo = await res.json();
    expect(corpo.message).toBe('Cadastro realizado com sucesso');
    expect(corpo._id).toBeTruthy();

    await excluir(request, 'usuarios', corpo._id);
  });

  test('não permite cadastrar e-mail já utilizado', async ({ request }) => {
    const usuario = await criarUsuario(request);

    const res = await request.post('/usuarios', {
      data: { nome: 'Outro Nome', email: usuario.email, password: 'Senha@123', administrador: 'false' },
    });

    expect(res.status()).toBe(400);
    expect((await res.json()).message).toBe('Este email já está sendo usado');

    await excluir(request, 'usuarios', usuario._id);
  });

  test('rejeita e-mail em formato inválido', async ({ request }) => {
    const res = await request.post('/usuarios', {
      data: { nome: 'Ana QA', email: 'email-invalido', password: 'Senha@123', administrador: 'false' },
    });

    expect(res.status()).toBe(400);
    expect((await res.json()).email).toBe('email deve ser um email válido');
  });

  test('rejeita cadastro sem campos obrigatórios', async ({ request }) => {
    const res = await request.post('/usuarios', { data: {} });

    expect(res.status()).toBe(400);
    const corpo = await res.json();
    expect(corpo.nome).toBeTruthy();
    expect(corpo.email).toBeTruthy();
    expect(corpo.password).toBeTruthy();
    expect(corpo.administrador).toBeTruthy();
  });

  test('busca usuário por id e confere os dados', async ({ request }) => {
    const usuario = await criarUsuario(request);

    const res = await request.get(`/usuarios/${usuario._id}`);

    expect(res.status()).toBe(200);
    const corpo = await res.json();
    expect(corpo._id).toBe(usuario._id);
    expect(corpo.email).toBe(usuario.email);

    await excluir(request, 'usuarios', usuario._id);
  });

  test('retorna 400 ao buscar usuário inexistente', async ({ request }) => {
    const res = await request.get('/usuarios/idInexistente123');

    expect(res.status()).toBe(400);
    expect((await res.json()).message).toBe('Usuário não encontrado');
  });
});
