const encoder = new TextEncoder();
const decoder = new TextDecoder();

function stableStringify(value) {
    if (Array.isArray(value)) {
        return `[${value.map((item) => stableStringify(item)).join(",")}]`;
    }
    if (value && typeof value === "object") {
        return `{${Object.keys(value)
            .sort()
            .map((key) => `${JSON.stringify(key)}:${stableStringify(value[key])}`)
            .join(",")}}`;
    }
    return JSON.stringify(value);
}

function bufferToBase64(buffer) {
    const bytes = new Uint8Array(buffer);
    let binary = "";
    bytes.forEach((byte) => {
        binary += String.fromCharCode(byte);
    });
    return btoa(binary);
}

function base64ToBuffer(base64) {
    const binary = atob(base64);
    const bytes = new Uint8Array(binary.length);
    for (let index = 0; index < binary.length; index += 1) {
        bytes[index] = binary.charCodeAt(index);
    }
    return bytes.buffer;
}

function randomIv() {
    return crypto.getRandomValues(new Uint8Array(12));
}

export async function generateKeyPair() {
    return crypto.subtle.generateKey(
        {
            name: "RSA-OAEP",
            modulusLength: 2048,
            publicExponent: new Uint8Array([1, 0, 1]),
            hash: "SHA-256",
        },
        true,
        ["wrapKey", "unwrapKey"],
    );
}

export async function exportPublicKey(publicKey) {
    return crypto.subtle.exportKey("jwk", publicKey);
}

export async function exportPrivateKey(privateKey) {
    return crypto.subtle.exportKey("jwk", privateKey);
}

export async function importPublicKey(publicKeyJwk) {
    return crypto.subtle.importKey(
        "jwk",
        publicKeyJwk,
        {
            name: "RSA-OAEP",
            hash: "SHA-256",
        },
        true,
        ["wrapKey"],
    );
}

export async function importPrivateKey(privateKeyJwk) {
    return crypto.subtle.importKey(
        "jwk",
        privateKeyJwk,
        {
            name: "RSA-OAEP",
            hash: "SHA-256",
        },
        true,
        ["unwrapKey"],
    );
}

export async function fingerprintPublicKey(publicKeyJwk) {
    const serialized = stableStringify(publicKeyJwk);
    const digest = await crypto.subtle.digest("SHA-256", encoder.encode(serialized));
    return Array.from(new Uint8Array(digest))
        .map((value) => value.toString(16).padStart(2, "0"))
        .join("");
}

async function wrapForUsers(aesKey, senderPublicKey, recipientPublicKey) {
    const [wrappedKeySender, wrappedKeyRecipient] = await Promise.all([
        crypto.subtle.wrapKey("raw", aesKey, senderPublicKey, { name: "RSA-OAEP" }),
        crypto.subtle.wrapKey("raw", aesKey, recipientPublicKey, { name: "RSA-OAEP" }),
    ]);
    return {
        wrappedKeySender: bufferToBase64(wrappedKeySender),
        wrappedKeyRecipient: bufferToBase64(wrappedKeyRecipient),
    };
}

async function createEnvelope(payload, senderPublicKey, recipientPublicKey) {
    const aesKey = await crypto.subtle.generateKey(
        { name: "AES-GCM", length: 256 },
        true,
        ["encrypt", "decrypt"],
    );
    const iv = randomIv();
    const ciphertext = await crypto.subtle.encrypt(
        { name: "AES-GCM", iv },
        aesKey,
        encoder.encode(JSON.stringify(payload)),
    );
    const wrappedKeys = await wrapForUsers(aesKey, senderPublicKey, recipientPublicKey);
    return {
        aesKey,
        ciphertext: bufferToBase64(ciphertext),
        iv: bufferToBase64(iv),
        wrappedKeySender: wrappedKeys.wrappedKeySender,
        wrappedKeyRecipient: wrappedKeys.wrappedKeyRecipient,
    };
}

export async function encryptTextPayload(text, senderPublicKey, recipientPublicKey) {
    return createEnvelope({ messageType: "text", text }, senderPublicKey, recipientPublicKey);
}

export async function encryptMediaPayload(file, caption, senderPublicKey, recipientPublicKey) {
    const envelope = await createEnvelope(
        {
            messageType: "media",
            caption,
            fileName: file.name,
            mimeType: file.type || "application/octet-stream",
            size: file.size,
        },
        senderPublicKey,
        recipientPublicKey,
    );

    const mediaIv = randomIv();
    const encryptedFile = await crypto.subtle.encrypt(
        { name: "AES-GCM", iv: mediaIv },
        envelope.aesKey,
        await file.arrayBuffer(),
    );

    return {
        ciphertext: envelope.ciphertext,
        iv: envelope.iv,
        wrappedKeySender: envelope.wrappedKeySender,
        wrappedKeyRecipient: envelope.wrappedKeyRecipient,
        mediaIv: bufferToBase64(mediaIv),
        encryptedFile: new Blob([encryptedFile], { type: "application/octet-stream" }),
    };
}

async function unwrapMessageKey(wrappedKey, privateKey) {
    return crypto.subtle.unwrapKey(
        "raw",
        base64ToBuffer(wrappedKey),
        privateKey,
        { name: "RSA-OAEP" },
        { name: "AES-GCM", length: 256 },
        false,
        ["decrypt"],
    );
}

export async function decryptEnvelope(message, privateKey) {
    const aesKey = await unwrapMessageKey(message.wrappedKey, privateKey);
    const decrypted = await crypto.subtle.decrypt(
        { name: "AES-GCM", iv: new Uint8Array(base64ToBuffer(message.iv)) },
        aesKey,
        base64ToBuffer(message.ciphertext),
    );
    return {
        aesKey,
        payload: JSON.parse(decoder.decode(decrypted)),
    };
}

export async function decryptMedia(arrayBuffer, mediaIv, aesKey, mimeType) {
    const decrypted = await crypto.subtle.decrypt(
        { name: "AES-GCM", iv: new Uint8Array(base64ToBuffer(mediaIv)) },
        aesKey,
        arrayBuffer,
    );
    return new Blob([decrypted], { type: mimeType || "application/octet-stream" });
}

