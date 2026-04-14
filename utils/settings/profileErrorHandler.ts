import { LocalizedProfileUpdateError } from "@/interfaces/interface"

/** API error strings are often English; map to i18n for the active locale. */
const WRONG_CURRENT_PASSWORD_EN = /^current password is incorrect\.?$/i
const EMAIL_IN_USE_EN = /^email (address )?is already in use\.?$/i
const PHONE_IN_USE_EN = /^phone (number )?is already in use\.?$/i


export function localizeProfileUpdateError(rawMessage: string, translate: (key: string) => string): LocalizedProfileUpdateError {
    const trimmed = rawMessage.trim()

    if (WRONG_CURRENT_PASSWORD_EN.test(trimmed)) {
        const msg = translate("settings.wrongCurrentPassword")
        return { message: msg, fieldErrors: { currentPassword: msg } }
    }
    if (EMAIL_IN_USE_EN.test(trimmed)) {
        const msg = translate("settings.emailAlreadyInUse")
        return { message: msg, fieldErrors: { email: msg } }
    }
    if (PHONE_IN_USE_EN.test(trimmed)) {
        const msg = translate("settings.phoneAlreadyInUse")
        return { message: msg, fieldErrors: { phone: msg } }
    }

    return { message: trimmed, fieldErrors: {} }
}