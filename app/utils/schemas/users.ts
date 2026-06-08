import * as v from 'valibot'

export const updateProfileSchema = v.object({
  firstName: v.pipe(
    v.string('El nombre es obligatorio.'),
    v.nonEmpty('El nombre es obligatorio.'),
    v.maxLength(100, 'El nombre no puede superar los 100 caracteres.'),
  ),
  lastName: v.pipe(
    v.string('El apellido es obligatorio.'),
    v.nonEmpty('El apellido es obligatorio.'),
    v.maxLength(100, 'El apellido no puede superar los 100 caracteres.'),
  ),
  email: v.union([
    v.literal(''),
    v.pipe(v.string(), v.email('El email no es válido.')),
  ]),
  phone: v.optional(v.string()),
  dateOfBirth: v.optional(v.string()),
})

export type UpdateProfileInput = v.InferInput<typeof updateProfileSchema>
export type UpdateProfileOutput = v.InferOutput<typeof updateProfileSchema>

export const changePasswordSchema = v.pipe(
  v.object({
    currentPassword: v.pipe(
      v.string('La contraseña actual es obligatoria.'),
      v.nonEmpty('La contraseña actual es obligatoria.'),
    ),
    newPassword: v.pipe(
      v.string('La nueva contraseña es obligatoria.'),
      v.nonEmpty('La nueva contraseña es obligatoria.'),
      v.minLength(6, 'La nueva contraseña debe tener al menos 6 caracteres.'),
    ),
    confirmPassword: v.pipe(
      v.string('Debés confirmar la contraseña.'),
      v.nonEmpty('Debés confirmar la contraseña.'),
    ),
  }),
  v.forward(
    v.partialCheck(
      [['newPassword'], ['confirmPassword']],
      input => input.newPassword === input.confirmPassword,
      'Las contraseñas no coinciden.',
    ),
    ['confirmPassword'],
  ),
)

export type ChangePasswordInput = v.InferInput<typeof changePasswordSchema>
export type ChangePasswordOutput = v.InferOutput<typeof changePasswordSchema>
