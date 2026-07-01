const { createClient } = require("@supabase/supabase-js");

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!url || !serviceKey) {
  console.error("Faltan variables de entorno NEXT_PUBLIC_SUPABASE_URL o SUPABASE_SERVICE_ROLE_KEY");
  process.exit(1);
}

const supabase = createClient(url, serviceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

const newPassword = process.argv[2];
if (!newPassword || newPassword.length < 6) {
  console.error("Error: Por favor introduce una nueva contraseña de al menos 6 caracteres.");
  console.log("Uso: node --env-file=.env.local reset-admin-password.js <tu_nueva_contraseña>");
  process.exit(1);
}

async function run() {
  const email = "jblizarra@gmail.com";
  console.log(`Buscando usuario con email ${email}...`);
  
  const { data: { users }, error: listError } = await supabase.auth.admin.listUsers();
  if (listError) {
    console.error("Error listando usuarios:", listError.message);
    process.exit(1);
  }
  
  const user = users.find(u => u.email === email);
  if (!user) {
    console.error(`Error: No se encontró ningún usuario con el correo ${email}`);
    process.exit(1);
  }
  
  console.log(`Usuario encontrado (ID: ${user.id}). Actualizando contraseña...`);
  
  const { data, error: updateError } = await supabase.auth.admin.updateUserById(
    user.id,
    { password: newPassword }
  );
  
  if (updateError) {
    console.error("Error al actualizar la contraseña:", updateError.message);
    process.exit(1);
  }
  
  console.log(`¡Contraseña actualizada con éxito para ${email}! Ahora puedes iniciar sesión.`);
}

run();
