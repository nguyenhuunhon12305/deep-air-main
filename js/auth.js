// XÁC THỰC ĐĂNG NHẬP CHO WEBSITE TĨNH DEEP AIR
// Lưu ý: Cơ chế này phù hợp demo/bảo vệ đồ án vì tài khoản được lưu ở localStorage trình duyệt.
// Khi triển khai thật nên dùng Firebase Authentication hoặc backend để bảo mật tốt hơn.

const DEEP_AIR_ACCOUNT_KEY = "deepAirAccounts";
const DEEP_AIR_LOGIN_KEYS = ["deepAirLoggedIn", "deepAirUser", "deepAirRole", "deepAirUsername"];

const DEEP_AIR_DEFAULT_ACCOUNTS = [
    {
        username: "admin",
        password: "Admin@123",
        displayName: "Quản trị viên",
        role: "admin",
        email: "admin@deepair.local",
        recoveryCode: "HCMUTE2026",
        createdAt: "2026-06-30"
    }
];

function deepAirNormalize(text) {
    return String(text || "").trim().toLowerCase();
}

function deepAirSafeParse(jsonText, fallback) {
    try {
        const value = JSON.parse(jsonText);
        return Array.isArray(value) ? value : fallback;
    } catch (error) {
        return fallback;
    }
}

function deepAirPasswordValidation(password) {
    const specialRegex = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?`~]/;

    if (!password || password.length <= 6) {
        return {
            valid: false,
            message: "Mật khẩu phải dài hơn 6 ký tự."
        };
    }

    if (!specialRegex.test(password)) {
        return {
            valid: false,
            message: "Mật khẩu phải có ít nhất 1 ký tự đặc biệt, ví dụ: @, #, $, !."
        };
    }

    return {
        valid: true,
        message: "Mật khẩu hợp lệ."
    };
}

function deepAirIsValidUsername(username) {
    return /^[a-zA-Z0-9._-]{3,30}$/.test(username || "");
}

function deepAirInitializeAccounts() {
    const savedAccounts = deepAirSafeParse(localStorage.getItem(DEEP_AIR_ACCOUNT_KEY), null);
    let accounts = savedAccounts && savedAccounts.length ? savedAccounts : DEEP_AIR_DEFAULT_ACCOUNTS;

    accounts = accounts.map(account => ({
        username: account.username || "",
        password: account.password || "",
        displayName: account.displayName || account.username || "Người dùng",
        role: account.role || "user",
        email: account.email || "",
        recoveryCode: account.recoveryCode || "",
        createdAt: account.createdAt || new Date().toISOString().slice(0, 10)
    }));

    const adminIndex = accounts.findIndex(account => deepAirNormalize(account.username) === "admin");
    if (adminIndex === -1) {
        accounts.unshift(DEEP_AIR_DEFAULT_ACCOUNTS[0]);
    } else {
        // Nâng cấp tài khoản admin cũ từ admin123 sang mật khẩu đúng yêu cầu bảo mật.
        if (accounts[adminIndex].password === "admin123") {
            accounts[adminIndex].password = "Admin@123";
        }
        accounts[adminIndex].role = "admin";
        accounts[adminIndex].displayName = accounts[adminIndex].displayName || "Quản trị viên";
        accounts[adminIndex].email = accounts[adminIndex].email || "admin@deepair.local";
        accounts[adminIndex].recoveryCode = accounts[adminIndex].recoveryCode || "HCMUTE2026";
    }

    localStorage.setItem(DEEP_AIR_ACCOUNT_KEY, JSON.stringify(accounts));
    return accounts;
}

function deepAirGetAccounts() {
    return deepAirInitializeAccounts();
}

function deepAirSaveAccounts(accounts) {
    localStorage.setItem(DEEP_AIR_ACCOUNT_KEY, JSON.stringify(accounts));
}

function getDeepAirStorage(remember) {
    return remember ? localStorage : sessionStorage;
}

function deepAirClearLoginState() {
    DEEP_AIR_LOGIN_KEYS.forEach(key => {
        localStorage.removeItem(key);
        sessionStorage.removeItem(key);
    });
}

function deepAirLogin(usernameOrEmail, password, remember) {
    const keyword = deepAirNormalize(usernameOrEmail);
    const accounts = deepAirGetAccounts();
    const account = accounts.find(user =>
        deepAirNormalize(user.username) === keyword ||
        (user.email && deepAirNormalize(user.email) === keyword)
    );

    if (!account || account.password !== password) {
        return {
            success: false,
            message: "Sai tài khoản hoặc mật khẩu. Vui lòng kiểm tra lại."
        };
    }

    deepAirClearLoginState();

    const storage = getDeepAirStorage(remember);
    storage.setItem("deepAirLoggedIn", "true");
    storage.setItem("deepAirUser", account.displayName);
    storage.setItem("deepAirRole", account.role);
    storage.setItem("deepAirUsername", account.username);

    return {
        success: true,
        user: account
    };
}

function isDeepAirLoggedIn() {
    return localStorage.getItem("deepAirLoggedIn") === "true" ||
           sessionStorage.getItem("deepAirLoggedIn") === "true";
}

function getDeepAirCurrentUser() {
    return localStorage.getItem("deepAirUser") ||
           sessionStorage.getItem("deepAirUser") ||
           "Người dùng";
}

function getDeepAirCurrentUsername() {
    return localStorage.getItem("deepAirUsername") ||
           sessionStorage.getItem("deepAirUsername") ||
           "";
}

function getDeepAirCurrentRole() {
    return localStorage.getItem("deepAirRole") ||
           sessionStorage.getItem("deepAirRole") ||
           "";
}

function isDeepAirAdmin() {
    return getDeepAirCurrentRole() === "admin";
}

function deepAirCreateAccount(accountData) {
    if (!isDeepAirAdmin()) {
        return {
            success: false,
            message: "Chỉ tài khoản quản trị viên mới được tạo tài khoản mới."
        };
    }

    const username = String(accountData.username || "").trim();
    const displayName = String(accountData.displayName || "").trim();
    const email = String(accountData.email || "").trim();
    const password = String(accountData.password || "");
    const role = accountData.role === "admin" ? "admin" : "user";
    const recoveryCode = String(accountData.recoveryCode || "").trim();

    if (!deepAirIsValidUsername(username)) {
        return {
            success: false,
            message: "Tên đăng nhập phải từ 3-30 ký tự và chỉ gồm chữ, số, dấu chấm, gạch dưới hoặc gạch ngang."
        };
    }

    if (!displayName) {
        return {
            success: false,
            message: "Vui lòng nhập tên hiển thị cho tài khoản."
        };
    }

    const passwordCheck = deepAirPasswordValidation(password);
    if (!passwordCheck.valid) {
        return {
            success: false,
            message: passwordCheck.message
        };
    }

    if (recoveryCode.length < 4) {
        return {
            success: false,
            message: "Mã khôi phục/quên mật khẩu phải có ít nhất 4 ký tự."
        };
    }

    const accounts = deepAirGetAccounts();
    const existed = accounts.some(account =>
        deepAirNormalize(account.username) === deepAirNormalize(username) ||
        (email && deepAirNormalize(account.email) === deepAirNormalize(email))
    );

    if (existed) {
        return {
            success: false,
            message: "Tên đăng nhập hoặc email đã tồn tại."
        };
    }

    accounts.push({
        username,
        password,
        displayName,
        role,
        email,
        recoveryCode,
        createdAt: new Date().toISOString().slice(0, 10)
    });

    deepAirSaveAccounts(accounts);

    return {
        success: true,
        message: `Đã tạo tài khoản ${username} thành công.`
    };
}


function deepAirRegisterAccount(accountData) {
    const username = String(accountData.username || "").trim();
    const displayName = String(accountData.displayName || "").trim();
    const email = String(accountData.email || "").trim();
    const password = String(accountData.password || "");
    const recoveryCode = String(accountData.recoveryCode || "").trim();

    if (!deepAirIsValidUsername(username)) {
        return {
            success: false,
            message: "Tên đăng nhập phải từ 3-30 ký tự và chỉ gồm chữ, số, dấu chấm, gạch dưới hoặc gạch ngang."
        };
    }

    if (!displayName) {
        return {
            success: false,
            message: "Vui lòng nhập tên hiển thị cho tài khoản."
        };
    }

    const passwordCheck = deepAirPasswordValidation(password);
    if (!passwordCheck.valid) {
        return {
            success: false,
            message: passwordCheck.message
        };
    }

    if (recoveryCode.length < 4) {
        return {
            success: false,
            message: "Mã khôi phục/quên mật khẩu phải có ít nhất 4 ký tự."
        };
    }

    const accounts = deepAirGetAccounts();
    const existed = accounts.some(account =>
        deepAirNormalize(account.username) === deepAirNormalize(username) ||
        (email && deepAirNormalize(account.email) === deepAirNormalize(email))
    );

    if (existed) {
        return {
            success: false,
            message: "Tên đăng nhập hoặc email đã tồn tại."
        };
    }

    accounts.push({
        username,
        password,
        displayName,
        role: "user",
        email,
        recoveryCode,
        createdAt: new Date().toISOString().slice(0, 10)
    });

    deepAirSaveAccounts(accounts);

    return {
        success: true,
        message: `Tạo tài khoản ${username} thành công. Bạn có thể đăng nhập bằng tài khoản vừa tạo.`
    };
}

function deepAirResetPassword(usernameOrEmail, recoveryCode, newPassword) {
    const keyword = deepAirNormalize(usernameOrEmail);
    const code = String(recoveryCode || "").trim();
    const passwordCheck = deepAirPasswordValidation(newPassword);

    if (!passwordCheck.valid) {
        return {
            success: false,
            message: passwordCheck.message
        };
    }

    const accounts = deepAirGetAccounts();
    const index = accounts.findIndex(account =>
        (deepAirNormalize(account.username) === keyword ||
        (account.email && deepAirNormalize(account.email) === keyword)) &&
        account.recoveryCode === code
    );

    if (index === -1) {
        return {
            success: false,
            message: "Không tìm thấy tài khoản hoặc mã khôi phục không đúng."
        };
    }

    accounts[index].password = newPassword;
    deepAirSaveAccounts(accounts);

    return {
        success: true,
        message: "Đặt lại mật khẩu thành công. Bạn có thể đăng nhập bằng mật khẩu mới."
    };
}

function deepAirDeleteAccount(username) {
    if (!isDeepAirAdmin()) {
        return {
            success: false,
            message: "Chỉ quản trị viên mới được xóa tài khoản."
        };
    }

    const normalizedUsername = deepAirNormalize(username);
    if (normalizedUsername === "admin") {
        return {
            success: false,
            message: "Không được xóa tài khoản admin mặc định."
        };
    }

    const accounts = deepAirGetAccounts();
    const nextAccounts = accounts.filter(account => deepAirNormalize(account.username) !== normalizedUsername);

    if (accounts.length === nextAccounts.length) {
        return {
            success: false,
            message: "Không tìm thấy tài khoản cần xóa."
        };
    }

    deepAirSaveAccounts(nextAccounts);
    return {
        success: true,
        message: "Đã xóa tài khoản thành công."
    };
}

function deepAirLogout() {
    deepAirClearLoginState();
    window.location.href = "index.html";
}

(function protectPrivatePages() {
    deepAirInitializeAccounts();

    const publicPages = ["index.html", ""];
    const currentPage = window.location.pathname.split("/").pop();
    const isPublicPage = publicPages.includes(currentPage);

    // Chỉ chặn các trang bên trong nếu chưa đăng nhập.
    // Không tự chuyển khỏi index.html, để người dùng luôn thấy form đăng nhập khi mở trang chủ.
    if (!isPublicPage && !isDeepAirLoggedIn()) {
        window.location.href = "index.html";
    }
})();
