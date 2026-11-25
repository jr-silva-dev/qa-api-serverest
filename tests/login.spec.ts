import { test, expect } from '@playwright/test';
import { criarUsuario, excluir } from '../support/api';

test.describe('Login', () => {
  test('autentica com credenciais válidas e devolve o token', async ({ request }) => {
    const usuario = await criarUsuario(request);

    const res = await request.post('/login', {
      data: { email: usuario.email, password: usuario.password },
    });

    expect(res.status()).toBe(200);
    const corpo = await res.json();
    expect(corpo.message).toBe('Login realizado com sucesso');
    expect(corpo.authorization).toMatch(/^Bearer /);

    await excluir(request, 'usuarios', usuario._id);
  });

  test('recusa senha incorreta', async ({ request }) => {
    const usuario = await criarUsuario(request);

    const res = await request.post('/login', {
      data: { email: usuario.email, password: 'senha-errada' },
    });

    expect(res.status()).toBe(401);
    expect((await res.json()).message).toBe('Email e/ou senha inválidos');

    await excluir(request, 'usuarios', usuario._id);
  });

  test('recusa e-mail não cadastrado', async ({ request }) => {
    const res = await request.post('/login', {
      data: { email: 'nao.existe@teste.com', password: 'Senha@123' },
    });

    expect(res.status()).toBe(401);
    expect((await res.json()).message).toBe('Email e/ou senha inválidos');
  });
});
