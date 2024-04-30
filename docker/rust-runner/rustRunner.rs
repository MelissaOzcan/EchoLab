use std::process::{Command, Stdio};
use std::io::{self, Read, Write};
use std::fs;

fn main() -> io::Result<()> {
    let code_filename = "code.rs";
    let output_filename = "output.txt";
    let executable_filename = "user_code";

    let status = Command::new("rustc")
        .arg(code_filename)
        .arg("-o")
        .arg(executable_filename)
        .status()?;

    if !status.success() {
        return Err(io::Error::new(io::ErrorKind::Other, "Compilation failed"));
    }

    let output = Command::new(format!("./{}", executable_filename))
        .output()?;

    let mut file = fs::File::create(output_filename)?;
    file.write_all(&output.stdout)?;
    file.write_all(&output.stderr)?;

    let mut file = fs::File::open(output_filename)?;
    let mut contents = String::new();
    file.read_to_string(&mut contents)?;
    print!("{}", contents);

    Ok(())
}
