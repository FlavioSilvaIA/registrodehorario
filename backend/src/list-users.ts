import { Usuario } from './models';
import { sequelize } from './config/database';

async function listUsers() {
    try {
        await sequelize.authenticate();
        const usuarios = await Usuario.findAll();
        console.log(`Total de usuários: ${usuarios.length}`);
        usuarios.forEach(u => {
            console.log(`- ${u.usuarioLogin} (${u.usuarioNome})`);
        });
        process.exit(0);
    } catch (error) {
        console.error('Erro ao listar usuários:', error);
        process.exit(1);
    }
}

listUsers();
