import { test, expect } from '@playwright/test';
import { criarProduto, criarUsuario, excluir, login } from '../support/api';

test.describe('Produtos', () => {
  test('bloqueia cadastro sem token', async ({ request }) => {
    const res = await request.post('/produtos', {
      data: { nome: 'Sem token', preco: 10, descricao: 'x', quantidade: 1 },
    });

    expect(res.status()).toBe(401);
    expect((await res.json()).message).toContain('Token de acesso ausente');
  });

  test('bloqueia cadastro por usuário não administrador', async ({ request }) => {
    const comum = await criarUsuario(request, { administrador: false });
    const token = await login(request, comum);

    const res = await request.post('/produtos', {
      data: { nome: `Produto ${Date.now()}`, preco: 10, descricao: 'x', quantidade: 1 },
      headers: { Authorization: token },
    });

    expect(res.status()).toBe(403);
    expect((await res.json()).message).toBe('Rota exclusiva para administradores');

    await excluir(request, 'usuarios', comum._id);
  });

  test('administrador cadastra e consulta um produto', async ({ request }) => {
    const admin = await criarUsuario(request, { administrador: true });
    const token = await login(request, admin);
    const produto = await criarProduto(request, token);

    const res = await request.get(`/produtos/${produto._id}`);

    expect(res.status()).toBe(200);
    const corpo = await res.json();
    expect(corpo.nome).toBe(produto.nome);
    expect(corpo.preco).toBe(produto.preco);
    expect(corpo.quantidade).toBe(produto.quantidade);

    await excluir(request, 'produtos', produto._id, token);
    await excluir(request, 'usuarios', admin._id);
  });

  test('não permite dois produtos com o mesmo nome', async ({ request }) => {
    const admin = await criarUsuario(request, { administrador: true });
    const token = await login(request, admin);
    const produto = await criarProduto(request, token);

    const res = await request.post('/produtos', {
      data: { nome: produto.nome, preco: 20, descricao: 'duplicado', quantidade: 1 },
      headers: { Authorization: token },
    });

    expect(res.status()).toBe(400);
    expect((await res.json()).message).toBe('Já existe produto com esse nome');

    await excluir(request, 'produtos', produto._id, token);
    await excluir(request, 'usuarios', admin._id);
  });

  test('administrador exclui um produto', async ({ request }) => {
    const admin = await criarUsuario(request, { administrador: true });
    const token = await login(request, admin);
    const produto = await criarProduto(request, token);

    const res = await request.delete(`/produtos/${produto._id}`, { headers: { Authorization: token } });

    expect(res.status()).toBe(200);
    expect((await res.json()).message).toBe('Registro excluído com sucesso');

    await excluir(request, 'usuarios', admin._id);
  });
});
