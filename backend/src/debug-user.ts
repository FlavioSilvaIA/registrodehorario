import bcrypt from 'bcryptjs';
import { Usuario } from './models';
import { sequelize } from './config/database';

async function checkUser() {
    try {
        await sequelize.authenticate();
        const usuario = await Usuario.findOne({
            where: { usuarioLogin: 'flavio.silva' }
        });

        if (usuario) {
            console.log('Usuário encontrado:');
            console.log('Login:', usuario.usuarioLogin);
            console.log('Hash no banco:', usuario.usuarioSenha);

            const match = await bcrypt.compare('123456', usuario.usuarioSenha);
            console.log('Senha "123456" confere?', match);
        } else {
            console.log('Usuário flavio.silva NÃO encontrado no banco.');
        }
        process.exit(0);
    } catch (error) {
        console.error('Erro ao verificar usuário:', error);
        process.exit(1);
    }
}

checkUser();
