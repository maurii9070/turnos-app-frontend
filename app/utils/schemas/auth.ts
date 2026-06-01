import * as v from 'valibot'

export const loginSchema = v.object({
  dni: v.pipe(
    v.string('El DNI es obligatorio.'),
    v.nonEmpty('El DNI es obligatorio.'),
    v.regex(/^\d+$/, 'El DNI debe contener solo números.'),
  ),
  password: v.pipe(
    v.string('La contraseña es obligatoria.'),
    v.nonEmpty('La contraseña es obligatoria.'),
    v.minLength(6, 'La contraseña debe tener al menos 6 caracteres.'),
  ),
})

export const registerSchema = v.pipe(
  v.object({
    dni: v.pipe(
      v.string('El DNI es obligatorio.'),
      v.nonEmpty('El DNI es obligatorio.'),
      v.regex(/^\d+$/, 'El DNI debe contener solo números.'),
    ),
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
    password: v.pipe(
      v.string('La contraseña es obligatoria.'),
      v.nonEmpty('La contraseña es obligatoria.'),
      v.minLength(6, 'La contraseña debe tener al menos 6 caracteres.'),
    ),
    confirmPassword: v.pipe(
      v.string('Debés confirmar la contraseña.'),
      v.nonEmpty('Debés confirmar la contraseña.'),
    ),
    dateOfBirth: v.pipe(
      v.string('La fecha de nacimiento es obligatoria.'),
      v.nonEmpty('La fecha de nacimiento es obligatoria.'),
      v.isoDate('La fecha debe tener el formato AAAA-MM-DD.'),
    ),
  }),
  v.forward(
    v.partialCheck(
      [['password'], ['confirmPassword']],
      input => input.password === input.confirmPassword,
      'Las contraseñas no coinciden.',
    ),
    ['confirmPassword'],
  ),
)

export type LoginInput = v.InferInput<typeof loginSchema>
export type LoginOutput = v.InferOutput<typeof loginSchema>
export type RegisterInput = v.InferInput<typeof registerSchema>
export type RegisterOutput = v.InferOutput<typeof registerSchema>
