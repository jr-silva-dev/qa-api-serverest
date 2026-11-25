import { test, expect } from '@playwright/test';
import { criarProduto, criarUsuario, excluir, login } from '../support/api';

test.describe('Carrinhos', () => {
  test('bloqueia criação de carrinho sem token', async ({ request }) => {
    const res = await request.post('/carrinhos', {
      data: { produtos: [{ idProduto: 'qualquer', quantidade: 1 }] },
    });

    expect(res.status()).toBe(401);
  });

  test('cria carrinho com produto e conclui a compra', async ({ request }) => {
    const admin = await criarUsuario(request, { administrador: true });
    const token = await login(request, admin);
    const produto = await criarProduto(request, token);

    const criado = await request.post('/carrinhos', {
      data: { produtos: [{ idProduto: produto._id, quantidade: 2 }] },
      headers: { Authorization: token },
    });
    expect(criado.status()).toBe(201);
    expect((await criado.json()).message).toBe('Cadastro realizado com sucesso');

    const concluido = await request.delete('/carrinhos/concluir-compra', {
      headers: { Authorization: token },
    });
    expect(concluido.status()).toBe(200);
    expect((await concluido.json()).message).toBe('Registro excluído com sucesso');

    await excluir(request, 'produtos', produto._id, token);
    await excluir(request, 'usuarios', admin._id);
  });

  test('não permite adicionar mais unidades do que o estoque', async ({ request }) => {
    const admin = await criarUsuario(request, { administrador: true });
    const token = await login(request, admin);
    const produto = await criarProduto(request, token); // estoque: 10

    const res = await request.post('/carrinhos', {
      data: { produtos: [{ idProduto: produto._id, quantidade: 11 }] },
      headers: { Authorization: token },
    });

    expect(res.status()).toBe(400);
    expect((await res.json()).message).toBe('Produto não possui quantidade suficiente');

    await excluir(request, 'produtos', produto._id, token);
    await excluir(request, 'usuarios', admin._id);
  });
});
