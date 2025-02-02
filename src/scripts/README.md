# Criar e Fazer Deploy de Repositórios no GitHub Pages

Este projeto contém scripts em Node.js para criar automaticamente um repositório no GitHub e fazer o deploy do conteúdo local diretamente para o GitHub Pages.

## Pré-requisitos

1. **Node.js**: Certifique-se de ter o [Node.js](https://nodejs.org/) instalado em sua máquina.
2. **Git**: Tenha também o [Git](https://git-scm.com/) instalado.
3. **Chave de Acesso Pessoal (Personal Access Token)** do GitHub:
    - Você precisa de um **token** com permissões suficientes para criar repositórios e gerenciar GitHub Pages (geralmente as permissões `repo`, `pages` e/ou `workflow`).
    - [Como gerar um token no GitHub?](#como-obter-um-personal-access-token)
4. **Variável de ambiente `GITHUB_TOKEN`**: Você deve exportar seu token antes de rodar o script.  
   Exemplo em Unix-like (Linux/Mac):
   ```bash
   export GITHUB_TOKEN="Aqui"
