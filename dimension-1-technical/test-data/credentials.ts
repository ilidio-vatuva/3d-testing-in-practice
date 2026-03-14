export const PASSWORD = 'secret_sauce';

export const USERS = {
  standard: { username: 'standard_user',           password: PASSWORD },
  locked:   { username: 'locked_out_user',         password: PASSWORD },
  problem:  { username: 'problem_user',            password: PASSWORD },
  glitch:   { username: 'performance_glitch_user', password: PASSWORD },
  error:    { username: 'error_user',              password: PASSWORD },
  visual:   { username: 'visual_user',             password: PASSWORD },
} as const;

export type UserKey = keyof typeof USERS;
