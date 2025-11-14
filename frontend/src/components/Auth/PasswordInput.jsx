import { useState } from "react";
import { Eye, EyeClosed } from 'lucide-react'

function PasswordInput({label, ...props}){
    const [showPassword, setShowPassword] = useState(false);

    const toggleVisibility = () => {
        setShowPassword(!showPassword);
    };

    return(
        <div className="form-group">
            <label>{label}</label>

            <div className="password-container">
                <input type={showPassword ? 'text' : 'password'} {...props}/>
                
                <button type="button" onClick={toggleVisibility} className="toggle-password-btn">
                    {showPassword ? (
                        <Eye size={20} /> 
                    ) : (
                        <EyeClosed size={20} />
                    )}
                </button>
            </div>
        </div>
    )
}
export default PasswordInput;