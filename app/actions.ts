"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createSupabaseServerClient, createSupabaseServiceClient } from "@/lib/supabase/server";
import { validateProducerPrice } from "@/lib/pricing";
import { getCurrentUserRole } from "@/lib/data";
import type { ProducerPriceInput } from "@/lib/types";


export async function submitProducerPrice(formData: FormData) {
  const input: ProducerPriceInput = {
    productId: String(formData.get("productId") ?? ""),
    normalizedPrice: Number(formData.get("normalizedPrice")),
    unit: formData.get("unit") === "L" ? "L" : "kg",
    province: String(formData.get("province") ?? ""),
    effectiveDate: String(formData.get("effectiveDate") ?? ""),
    notes: String(formData.get("notes") ?? "")
  };

  const errors = validateProducerPrice(input);
  if (errors.length) {
    redirect(`/producer?error=${encodeURIComponent(errors[0])}`);
  }

  const supabase = createSupabaseServerClient();
  if (!supabase) {
    redirect("/producer?success=demo");
  }

  const { data: authData } = await supabase.auth.getUser();
  if (!authData.user) redirect("/login");

  const { data: producer } = await supabase
    .from("producer_profiles")
    .select("id")
    .eq("user_id", authData.user.id)
    .single();

  if (!producer) {
    redirect(`/producer?error=${encodeURIComponent("Crea o verifica tu perfil de productor antes de publicar precios.")}`);
  }

  const { error } = await supabase.from("producer_prices").insert({
    product_id: input.productId,
    producer_id: producer.id,
    normalized_price: input.normalizedPrice,
    unit: input.unit,
    province: input.province,
    effective_date: input.effectiveDate,
    notes: input.notes,
    status: "pending"
  });

  if (error) redirect(`/producer?error=${encodeURIComponent(error.message)}`);

  revalidatePath("/");
  revalidatePath("/producer");
  revalidatePath("/admin");
  redirect("/producer?success=pending");
}

export async function reviewProducerPrice(formData: FormData) {
  const id = String(formData.get("id") ?? "");
  const status = String(formData.get("status") ?? "");

  if (!id || !["approved", "rejected"].includes(status)) {
    redirect("/admin?error=Solicitud invalida");
  }

  const role = await getCurrentUserRole();
  if (role !== "admin") {
    redirect("/admin?error=No autorizado");
  }

  const supabase = createSupabaseServerClient();
  if (!supabase) redirect("/admin?success=demo");

  const { error } = await supabase
    .from("producer_prices")
    .update({ status })
    .eq("id", id);

  if (error) redirect(`/admin?error=${encodeURIComponent(error.message)}`);

  revalidatePath("/");
  revalidatePath("/comparador");
  revalidatePath("/admin");
  redirect("/admin?success=reviewed");
}

export async function signInAction(formData: FormData) {
  const email = String(formData.get("email") ?? "");
  const password = String(formData.get("password") ?? "");

  if (!email || !password) {
    redirect("/login?error=Email y contraseña requeridos");
  }

  const supabase = createSupabaseServerClient();
  if (!supabase) {
    redirect("/login?error=Supabase no esta configurado");
  }

  const { error } = await supabase.auth.signInWithPassword({
    email,
    password
  });

  if (error) {
    redirect(`/login?error=${encodeURIComponent(error.message)}`);
  }

  revalidatePath("/");
  revalidatePath("/admin");
  revalidatePath("/producer");
  redirect("/");
}

export async function signUpAction(formData: FormData) {
  const email = String(formData.get("email") ?? "");
  const password = String(formData.get("password") ?? "");

  if (!email || !password) {
    redirect("/login?error=Email y contraseña requeridos");
  }

  const supabase = createSupabaseServerClient();
  if (!supabase) {
    redirect("/login?error=Supabase no esta configurado");
  }

  const { error } = await supabase.auth.signUp({
    email,
    password
  });

  if (error) {
    redirect(`/login?error=${encodeURIComponent(error.message)}`);
  }

  redirect("/login?success=Registro exitoso. Inicia sesion o verifica tu correo.");
}

export async function signOutAction() {
  const supabase = createSupabaseServerClient();
  if (supabase) {
    await supabase.auth.signOut();
  }
  revalidatePath("/");
  revalidatePath("/admin");
  revalidatePath("/producer");
  redirect("/login");
}

export async function updateUserRoleAction(formData: FormData) {
  const targetUserId = String(formData.get("userId") ?? "");
  const newRole = String(formData.get("role") ?? "");

  if (!targetUserId || !["viewer", "producer", "admin"].includes(newRole)) {
    redirect("/admin?error=Datos de rol invalidos");
  }

  // Verificar que el usuario actual es admin
  const currentRole = await getCurrentUserRole();
  if (currentRole !== "admin") {
    redirect("/admin?error=No autorizado");
  }

  const supabase = createSupabaseServerClient();
  if (!supabase) {
    redirect("/admin?error=Supabase no esta configurado");
  }

  // Evitar que el administrador se cambie el rol a sí mismo
  const { data: authData } = await supabase.auth.getUser();
  if (authData.user && authData.user.id === targetUserId) {
    redirect("/admin?error=No puedes cambiar tu propio rol");
  }

  const serviceClient = createSupabaseServiceClient();
  if (!serviceClient) {
    redirect("/admin?error=Error de inicializacion del servicio");
  }

  const { error } = await serviceClient
    .from("profiles")
    .update({ role: newRole })
    .eq("id", targetUserId);

  if (error) {
    redirect(`/admin?error=${encodeURIComponent(error.message)}`);
  }

  revalidatePath("/admin");
  redirect("/admin?success=Rol de usuario actualizado");
}

